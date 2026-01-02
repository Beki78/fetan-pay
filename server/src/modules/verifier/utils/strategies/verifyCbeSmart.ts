import axios, { AxiosResponse } from 'axios';
import https from 'https';
import logger from '../logger';
import { parseCBEReceipt, VerifyResult } from './verifyCBE';

const CBE_SLIP_URL = 'https://apps.cbe.com.et:100/?id=';

export async function verifyCbeSmart(reference: string): Promise<VerifyResult> {
  const referenceId = reference?.trim();

  if (!referenceId) {
    logger.warn('⚠️ Missing transaction reference for smart CBE strategy');
    return { success: false, error: 'Transaction reference is required' };
  }

  const url = `${CBE_SLIP_URL}${encodeURIComponent(referenceId)}`;
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  try {
    logger.info('💡 Fetching smart CBE receipt', {
      url,
      reference: referenceId,
    });
    const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
      httpsAgent,
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        Accept: 'application/pdf',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    return await parseCBEReceipt(response.data);
  } catch (error: any) {
    logger.error('⚠️ Smart CBE fetch failed', error?.message ?? error);
    return {
      success: false,
      error: `Smart strategy failed to download receipt: ${error?.message ?? 'unknown'}`,
    };
  }
}
