import axios, { AxiosResponse } from 'axios';
import pdf from 'pdf-parse';
import https from 'https';
import logger from '../logger';
import { browserPool } from '../browser-pool';
import { verificationCache } from '../cache';
import { retryWithBackoff } from '../retry';

export interface VerifyResult {
  success: boolean;
  payer?: string;
  payerAccount?: string;
  receiver?: string;
  receiverAccount?: string;
  amount?: number;
  date?: Date;
  reference?: string;
  reason?: string | null;
  error?: string;
}

function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function verifyCBE(
  reference: string,
  accountSuffix: string,
): Promise<VerifyResult> {
  const fullId = `${reference}${accountSuffix}`;
  const cacheKey = verificationCache.getKey('CBE', reference, accountSuffix);

  // Check cache first
  const cached = verificationCache.get<VerifyResult>(cacheKey);
  if (cached) {
    logger.info(`✅ Cache hit for CBE verification: ${reference}`);
    return cached;
  }

  // Perform verification with retry
  const result = await retryWithBackoff(
    async () => {
      const url = `https://apps.cbe.com.et:100/?id=${fullId}`;
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

      // Strategy 1: Direct PDF fetch (fastest)
      try {
        logger.info(`🔎 Attempting direct fetch: ${url}`);
        const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
          httpsAgent,
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            Accept: 'application/pdf',
          },
          timeout: 30000,
        });

        logger.info('✅ Direct fetch success, parsing PDF');
        return await parseCBEReceipt(response.data);
      } catch (directErr: unknown) {
        const errorMessage =
          directErr instanceof Error ? directErr.message : String(directErr);
        logger.warn(
          '⚠️ Direct fetch failed, falling back to browser pool:',
          errorMessage,
        );

        // Strategy 2: Browser pool (fallback)
        const browser = await browserPool.acquire();
        try {
          const page = await browser.newPage();
          let detectedPdfUrl: string | null = null;

          page.on('response', (response) => {
            const contentType = response.headers()['content-type'];
            if (contentType?.includes('pdf')) {
              detectedPdfUrl = response.url();
              logger.info('🧾 PDF detected:', detectedPdfUrl);
            }
          });

          await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 20000,
          });
          await new Promise((res) => setTimeout(res, 3000));

          if (!detectedPdfUrl) {
            throw new Error('No PDF detected via browser pool.');
          }

          const pdfRes = await axios.get<ArrayBuffer>(detectedPdfUrl, {
            httpsAgent,
            responseType: 'arraybuffer',
          });

          return await parseCBEReceipt(pdfRes.data);
        } catch (puppetErr: unknown) {
          const errorMessage =
            puppetErr instanceof Error ? puppetErr.message : String(puppetErr);
          logger.error('❌ Browser pool failed:', errorMessage);
          throw new Error(
            `Both direct and browser pool failed: ${errorMessage}`,
          );
        } finally {
          browserPool.release(browser);
        }
      }
    },
    {
      maxRetries: 2,
      initialDelay: 1000,
      retryableErrors: ['timeout', 'network', 'ECONNRESET', 'ETIMEDOUT'],
    },
  );

  // Cache successful results only
  if (result.success) {
    verificationCache.set(cacheKey, result);
    logger.info(`✅ Cached CBE verification result: ${reference}`);
  }

  return result;
}

export async function parseCBEReceipt(
  buffer: ArrayBuffer,
): Promise<VerifyResult> {
  try {
    const parsed = await pdf(Buffer.from(buffer));
    const rawText = parsed.text.replace(/\s+/g, ' ').trim();

    let payerName = rawText.match(/Payer\s*:?\s*(.*?)\s+Account/i)?.[1]?.trim();
    let receiverName = rawText
      .match(/Receiver\s*:?\s*(.*?)\s+Account/i)?.[1]
      ?.trim();
    const accountMatches = [
      ...rawText.matchAll(/Account\s*:?\s*([A-Z0-9]?\*{4}\d{4})/gi),
    ];
    const payerAccount = accountMatches?.[0]?.[1];
    const receiverAccount = accountMatches?.[1]?.[1];

    const reason = rawText
      .match(
        /Reason\s*\/\s*Type of service\s*:?\s*(.*?)\s+Transferred Amount/i,
      )?.[1]
      ?.trim();
    const amountText = rawText.match(
      /Transferred Amount\s*:?\s*([\d,]+\.\d{2})\s*ETB/i,
    )?.[1];
    const referenceMatch = rawText
      .match(/Reference No\.?\s*\(VAT Invoice No\)\s*:?\s*([A-Z0-9]+)/i)?.[1]
      ?.trim();
    const dateRaw = rawText
      .match(/Payment Date & Time\s*:?\s*([\d/,: ]+[APM]{2})/i)?.[1]
      ?.trim();

    const amount = amountText
      ? parseFloat(amountText.replace(/,/g, ''))
      : undefined;
    const date = dateRaw ? new Date(dateRaw) : undefined;

    payerName = payerName ? titleCase(payerName) : undefined;
    receiverName = receiverName ? titleCase(receiverName) : undefined;

    if (
      payerName &&
      payerAccount &&
      receiverName &&
      receiverAccount &&
      amount &&
      date &&
      referenceMatch
    ) {
      return {
        success: true,
        payer: payerName,
        payerAccount,
        receiver: receiverName,
        receiverAccount,
        amount,
        date,
        reference: referenceMatch,
        reason: reason || null,
      };
    } else {
      return {
        success: false,
        error: 'Could not extract all required fields from PDF.',
      };
    }
  } catch (parseErr: unknown) {
    const errorMessage =
      parseErr instanceof Error ? parseErr.message : String(parseErr);
    logger.error('❌ PDF parsing failed:', errorMessage);
    return { success: false, error: 'Error parsing PDF data' };
  }
}
