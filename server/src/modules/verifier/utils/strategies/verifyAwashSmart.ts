import axios from 'axios';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import https from 'https';
import logger from '../logger';
import { VerifyResult } from './verifyCBE';

const AWASH_BASE_URL = 'https://awashpay.awashbank.com:8225/';

function normalizeLabel(text: string): string {
  return text
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function extractField($: CheerioAPI, labels: string[]): string | null {
  const normalizedTargets = labels.map((label) => normalizeLabel(label));
  const rows = $('table.info-table tr').toArray();

  for (const row of rows) {
    const cells = $(row).find('td').toArray();
    if (cells.length < 3) continue;

    const labelText = normalizeLabel($(cells[0]).text());
    if (!labelText) continue;

    for (const target of normalizedTargets) {
      if (labelText.includes(target)) {
        return $(cells[2]).text().trim();
      }
    }
  }

  return null;
}

function parseAmount(raw?: string | null): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d.]/g, '').trim();
  const numeric = parseFloat(cleaned);
  return Number.isNaN(numeric) ? undefined : numeric;
}

function parseDate(raw?: string | null): Date | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

async function fetchReceiptHtml(reference: string): Promise<string> {
  const url = `${AWASH_BASE_URL}${encodeURIComponent(reference)}`;
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  logger.info('💡 Fetching Awash receipt for smart verifier', { url });
  const response = await axios.get(url, {
    httpsAgent,
    timeout: 30000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  return typeof response.data === 'string' ? response.data : '';
}

export async function verifyAwashSmart(reference: string): Promise<VerifyResult> {
  const receiptId = reference?.trim();
  if (!receiptId) {
    logger.warn('⚠️ Missing Awash reference for smart strategy');
    return { success: false, error: 'Reference is required' };
  }

  try {
    const html = await fetchReceiptHtml(receiptId);
    const $ = cheerio.load(html);

    const payer = extractField($, ['sender name', 'customer name']);
    const receiver = extractField($, ['receiver name']);
    const payerAccount = extractField($, ['sender account']);
    const receiverAccount = extractField($, ['receiver account']);
    const amountText = extractField($, ['amount']);
    const dateText = extractField($, ['transaction date']);
    const referenceText =
      extractField($, ['transaction id', 'transaction reference']) ?? receiptId;
    const narrative = extractField($, ['reason']);

    const amount = parseAmount(amountText);
    const date = parseDate(dateText);

    if (!receiver || amount === undefined) {
      logger.warn(
        '⚠️ Unable to extract sender/receiver details from Awash receipt',
      );
      return { success: false, error: 'Failed to parse Awash receipt details' };
    }

    return {
      success: true,
      payer: payer ? payer.trim() : undefined,
      receiver: receiver.trim(),
      payerAccount: payerAccount ?? undefined,
      receiverAccount: receiverAccount ?? undefined,
      amount,
      date,
      reference: referenceText,
      reason: narrative || null,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'unknown';
    logger.error('⚠️ Awash smart fetch failed', message);
    return {
      success: false,
      error: `Smart strategy failed to download Awash receipt: ${message}`,
    };
  }
}