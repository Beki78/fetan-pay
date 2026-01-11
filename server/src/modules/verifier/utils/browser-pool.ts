import puppeteer, { Browser } from 'puppeteer';
import logger from './logger';

/**
 * Browser Pool for reusing browser instances
 * Reduces overhead of creating new browsers for each verification
 */
export class BrowserPool {
  private pool: Browser[] = [];
  private inUse = new Set<Browser>();
  private maxSize: number;
  private creating = false;

  constructor(maxSize = 3) {
    this.maxSize = maxSize;
  }

  /**
   * Acquire a browser from the pool
   * Reuses existing browser if available, otherwise creates new one
   */
  async acquire(): Promise<Browser> {
    // Try to get existing browser from pool that's not in use
    const available = this.pool.find((b) => !this.inUse.has(b));
    if (available) {
      this.inUse.add(available);
      logger.debug(
        `Reusing browser from pool (${this.inUse.size}/${this.pool.length} in use)`,
      );
      return available;
    }

    // Create new browser if pool not full
    if (this.pool.length < this.maxSize) {
      logger.debug(
        `Creating new browser (${this.pool.length + 1}/${this.maxSize})`,
      );
      const browser = await this.createBrowser();
      this.pool.push(browser);
      this.inUse.add(browser);
      return browser;
    }

    // Wait for browser to be released
    logger.debug('All browsers in use, waiting for release...');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const available = this.pool.find((b) => !this.inUse.has(b));
        if (available) {
          clearInterval(checkInterval);
          this.inUse.add(available);
          logger.debug(
            `Browser released, acquired (${this.inUse.size}/${this.pool.length} in use)`,
          );
          resolve(available);
        }
      }, 100);
    });
  }

  /**
   * Release a browser back to the pool
   */
  release(browser: Browser): void {
    if (this.inUse.has(browser)) {
      this.inUse.delete(browser);
      logger.debug(
        `Browser released (${this.inUse.size}/${this.pool.length} in use)`,
      );
    }
  }

  /**
   * Create a new browser instance with optimized settings
   */
  private async createBrowser(): Promise<Browser> {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-features=TranslateUI',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic',
        '--use-mock-keychain',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      total: this.pool.length,
      inUse: this.inUse.size,
      available: this.pool.length - this.inUse.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Close all browsers and clear the pool
   */
  async closeAll(): Promise<void> {
    logger.info('Closing all browsers in pool...');
    await Promise.all(
      this.pool.map((b) =>
        b.close().catch((err) => logger.error('Error closing browser:', err)),
      ),
    );
    this.pool = [];
    this.inUse.clear();
    logger.info('All browsers closed');
  }

  /**
   * Clean up dead browsers from the pool
   */
  async cleanup(): Promise<void> {
    const deadBrowsers: Browser[] = [];

    for (const browser of this.pool) {
      try {
        // Try to get pages to check if browser is alive
        await browser.pages();
      } catch {
        // Browser is dead, mark for removal
        deadBrowsers.push(browser);
        this.inUse.delete(browser);
      }
    }

    // Remove dead browsers from pool
    this.pool = this.pool.filter((b) => !deadBrowsers.includes(b));

    if (deadBrowsers.length > 0) {
      logger.warn(
        `Cleaned up ${deadBrowsers.length} dead browser(s) from pool`,
      );
    }
  }
}

// Singleton instance
export const browserPool = new BrowserPool(
  parseInt(process.env.BROWSER_POOL_SIZE || '3', 10),
);

// Cleanup on process exit
process.on('SIGTERM', () => {
  void browserPool.closeAll();
});

process.on('SIGINT', () => {
  void browserPool.closeAll();
});
