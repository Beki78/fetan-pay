import axios from 'axios';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import https from 'https';
import logger from '../logger';
import { VerifyResult } from './verifyCBE';
import { verificationCache } from '../cache';
import { retryWithBackoff } from '../retry';

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

  // Try multiple table selectors
  const tableSelectors = ['table.info-table', 'table', '.info-table'];

  for (const selector of tableSelectors) {
    const rows = $(selector + ' tr').toArray();

    for (const row of rows) {
      const cells = $(row).find('td').toArray();

      // Handle different table structures
      // Structure 1: label | separator | value (3 cells)
      if (cells.length >= 3) {
        const labelText = normalizeLabel($(cells[0]).text());
        if (!labelText) continue;

        for (const target of normalizedTargets) {
          if (labelText.includes(target)) {
            return $(cells[2]).text().trim();
          }
        }
      }

      // Structure 2: label | value (2 cells)
      if (cells.length === 2) {
        const labelText = normalizeLabel($(cells[0]).text());
        if (!labelText) continue;

        for (const target of normalizedTargets) {
          if (labelText.includes(target)) {
            return $(cells[1]).text().trim();
          }
        }
      }

      // Structure 3: single cell with label and value (1 cell)
      if (cells.length === 1) {
        const cellText = $(cells[0]).text();
        const normalizedText = normalizeLabel(cellText);

        for (const target of normalizedTargets) {
          if (normalizedText.includes(target)) {
            // Try to extract value after colon or equals
            const colonMatch = cellText.match(/:\s*(.+)/);
            if (colonMatch) return colonMatch[1].trim();

            const equalsMatch = cellText.match(/=\s*(.+)/);
            if (equalsMatch) return equalsMatch[1].trim();

            // Return the whole text if no separator found
            return cellText.trim();
          }
        }
      }
    }

    // If we found rows with this selector, don't try other selectors
    if (rows.length > 0) break;
  }

  // Try alternative: look for divs or spans with class/id containing field names
  for (const target of normalizedTargets) {
    const divSelector = `div[class*="${target}"], span[class*="${target}"]`;
    const element = $(divSelector).first();
    if (element.length > 0) {
      return element.text().trim();
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

export async function verifyAwashSmart(
  reference: string,
): Promise<VerifyResult> {
  const receiptId = reference?.trim();
  if (!receiptId) {
    logger.warn('⚠️ Missing Awash reference for smart strategy');
    return { success: false, error: 'Reference is required' };
  }

  const cacheKey = verificationCache.getKey('AWASH_SMART', reference);

  // Check cache first
  const cached = verificationCache.get<VerifyResult>(cacheKey);
  if (cached) {
    logger.info(`✅ Cache hit for Awash Smart verification: ${reference}`);
    return cached;
  }

  // Perform verification with retry
  const result = await retryWithBackoff(
    async () => {
      const html = await fetchReceiptHtml(receiptId);
      const $ = cheerio.load(html);

      // Debug: Log the HTML structure
      const tables = $('table').length;
      const infoTables = $('table.info-table').length;
      logger.info(
        `📊 Awash receipt structure: ${tables} tables, ${infoTables} info-tables`,
      );

      // Debug: Log first 2000 chars of HTML to see structure
      logger.info(`📄 HTML preview: ${html.substring(0, 2000)}`);

      // Debug: Log all table rows with ALL cell counts
      $('table tr').each((i, row) => {
        const cells = $(row).find('td').toArray();
        if (cells.length > 0) {
          const cellTexts = cells.map((cell) => $(cell).text().trim());
          logger.info(
            `  Row ${i} (${cells.length} cells): ${JSON.stringify(cellTexts)}`,
          );
        }
      });

      const payer = extractField($, [
        'sender name',
        'customer name',
        'payer name',
        'from',
        'sender',
        'payer',
      ]);
      const receiver = extractField($, [
        'receiver name',
        'beneficiary name',
        'recipient name',
        'to',
        'receiver',
        'beneficiary',
        'recipient',
      ]);
      const payerAccount = extractField($, [
        'sender account',
        'payer account',
        'from account',
        'sender account number',
        'account number from',
      ]);
      const receiverAccount = extractField($, [
        'receiver account',
        'beneficiary account',
        'to account',
        'receiver account number',
        'account number to',
      ]);
      const amountText = extractField($, [
        'amount',
        'transaction amount',
        'total amount',
        'transfer amount',
      ]);
      const dateText = extractField($, [
        'transaction date',
        'date',
        'transfer date',
        'payment date',
      ]);
      const referenceText =
        extractField($, [
          'transaction id',
          'transaction reference',
          'reference',
          'reference number',
          'transaction number',
        ]) ?? receiptId;
      const narrative = extractField($, [
        'reason',
        'narration',
        'description',
        'remark',
        'note',
      ]);

      const amount = parseAmount(amountText);
      const date = parseDate(dateText);

      logger.info(`📦 Extracted fields:`, {
        payer,
        receiver,
        payerAccount,
        receiverAccount,
        amount,
        amountText,
        date,
        reference: referenceText,
      });

      if (!receiver || amount === undefined) {
        logger.warn(
          '⚠️ Unable to extract sender/receiver details from Awash receipt',
          { receiver, amount, amountText }
        );
        throw new Error('Failed to parse Awash receipt details');
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
    },
    {
      maxRetries: 2,
      initialDelay: 1000,
      retryableErrors: ['timeout', 'network', 'ECONNRESET', 'ETIMEDOUT'],
    },
  ).catch((error: unknown) => {
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
  });

  // Cache successful results only
  if (result.success) {
    verificationCache.set(cacheKey, result);
    logger.info(`✅ Cached Awash Smart verification result: ${reference}`);
  }

  return result;
}
