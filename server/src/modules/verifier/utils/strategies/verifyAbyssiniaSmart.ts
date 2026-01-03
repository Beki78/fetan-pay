import axios from 'axios';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import https from 'https';
import logger from '../logger';
import { VerifyResult } from './verifyCBE';

const ABYSSINIA_SLIP_URL = 'https://cs.bankofabyssinia.com/slip/?trx=';

let puppeteer: typeof import('puppeteer') | null = null;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  logger.warn('Puppeteer is not available for Abyssinia smart fetch');
}

function normalizeLabel(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function findNextCellText($: CheerioAPI, label: string): string | null {
  const target = normalizeLabel(label);
  const cells = $('td').toArray();
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    const value = normalizeLabel($(cell).text());
    if (value.includes(target)) {
      const next = cells[i + 1];
      if (next) {
        const nextText = $(next).text().trim();
        if (nextText) return nextText;
      }
    }
  }
  return null;
}

function extractField($: CheerioAPI, labels: string[]): string | null {
  for (const label of labels) {
    const text = findNextCellText($, label);
    if (text) return text;
  }
  return null;
}

function parseAmount(raw?: string | null): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseDate(raw?: string | null): Date | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const match = trimmed.match(
    /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/,
  );
  if (!match) return undefined;
  const [, day, month, yearRaw, hourRaw = '0', minuteRaw = '0'] = match;
  let year = parseInt(yearRaw, 10);
  if (yearRaw.length <= 2) {
    year += year >= 70 ? 1900 : 2000;
  }
  const date = new Date(
    year,
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hourRaw, 10),
    parseInt(minuteRaw, 10),
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

async function renderSlipWithPuppeteer(reference: string): Promise<string> {
  if (!puppeteer) {
    throw new Error('Puppeteer is not available');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`${ABYSSINIA_SLIP_URL}${encodeURIComponent(reference)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await page.waitForSelector('table', { timeout: 10000 });
    return await page.content();
  } finally {
    await browser.close();
  }
}

async function fetchSlipHtml(reference: string): Promise<string> {
  if (puppeteer) {
    try {
      logger.info('✨ Rendering Abyssinia slip via Puppeteer');
      return await renderSlipWithPuppeteer(reference);
    } catch (error: any) {
      logger.warn('⚠️ Puppeteer render failed, falling back to HTTP fetch', {
        message: error?.message ?? error,
      });
    }
  }

  const url = `${ABYSSINIA_SLIP_URL}${encodeURIComponent(reference)}`;
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  const response = await axios.get(url, {
    httpsAgent,
    timeout: 30000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  return typeof response.data === 'string' ? response.data : '';
}

export async function verifyAbyssiniaSmart(
  reference: string,
): Promise<VerifyResult> {
  const slipId = reference?.trim();

  if (!slipId) {
    logger.warn('⚠️ Missing Abyssinia reference for smart strategy');
    return { success: false, error: 'Reference is required' };
  }

  try {
    const html = await fetchSlipHtml(slipId);
    const $ = cheerio.load(html);

    const receiver = extractField($, [
      "receiver's name",
      'receiver name',
      'receiver',
    ]);
    const payer = extractField($, [
      'source account name',
      'source account',
      'payer name',
      'payer',
    ]);
    const amountText = extractField($, [
      'transferred amount',
      'amount',
      'settled amount',
    ]);
    const dateText = extractField($, [
      'transaction date',
      'date',
      'payment date',
    ]);
    const referenceText =
      extractField($, ['transaction reference', 'reference']) ?? slipId;
    const narrative = extractField($, ['narrative', 'description', 'reason']);

    const amount = parseAmount(amountText);
    const date = parseDate(dateText);

    if (!receiver || amount === undefined) {
      logger.warn('⚠️ Unable to extract required fields from Abyssinia slip');
      return {
        success: false,
        error: 'Failed to parse Abyssinia slip details',
      };
    }

    return {
      success: true,
      payer: payer ? titleCase(payer) : undefined,
      receiver: titleCase(receiver),
      amount,
      date,
      reference: referenceText,
      reason: narrative || null,
    };
  } catch (error: any) {
    logger.error('⚠️ Smart Abyssinia fetch failed', error?.message ?? error);
    return {
      success: false,
      error: `Smart strategy failed to download Abyssinia slip: ${
        error?.message ?? 'unknown'
      }`,
    };
  }
}
