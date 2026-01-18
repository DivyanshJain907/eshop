import puppeteer, { Browser, Page } from 'puppeteer';

export interface DetectedSelectors {
  productContainer: string;
  productName: string;
  productBrand: string;
  productPrice: string;
  productImage: string;
  productUrl?: string;
  confidence: number;
}

/**
 * Auto-detect CSS selectors from a website's search results page
 */
export async function autoDetectSelectors(searchUrl: string): Promise<DetectedSelectors | null> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`🔍 Auto-detecting selectors for: ${searchUrl}`);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Analyze the page structure
    const detected = await page.evaluate(() => {
      // Common patterns for product containers
      const containerPatterns = [
        '[data-product]',
        '[data-product-id]',
        '.product-item',
        '.product-card',
        '.product',
        '.item',
        '[itemtype*="Product"]',
        '.grid-item',
        '.search-result',
        'article',
      ];

      // Common patterns for prices (with ₹, $, Rs, etc.)
      const pricePatterns = [
        '.price',
        '.product-price',
        '[data-price]',
        '.cost',
        '.amount',
        'span[class*="price"]',
        'div[class*="price"]',
      ];

      let bestContainer = '';
      let bestCount = 0;

      // Find the container that appears most frequently
      for (const pattern of containerPatterns) {
        const elements = document.querySelectorAll(pattern);
        if (elements.length > bestCount && elements.length >= 3) {
          // Need at least 3 products
          bestContainer = pattern;
          bestCount = elements.length;
        }
      }

      if (!bestContainer) {
        // Fallback: look for repeating structures
        const allDivs = document.querySelectorAll('div[class]');
        const classCount: { [key: string]: number } = {};

        allDivs.forEach((div) => {
          const className = div.className.split(' ')[0];
          if (className) {
            classCount[className] = (classCount[className] || 0) + 1;
          }
        });

        // Find most common class that appears 3+ times
        let maxClass = '';
        let maxCount = 0;
        for (const [cls, count] of Object.entries(classCount)) {
          if (count >= 3 && count > maxCount) {
            maxClass = cls;
            maxCount = count;
          }
        }

        if (maxClass) {
          bestContainer = `.${maxClass}`;
          bestCount = maxCount;
        }
      }

      if (!bestContainer) {
        return null;
      }

      // Analyze the first few product containers
      const containers = document.querySelectorAll(bestContainer);
      const sampleContainers = Array.from(containers).slice(0, 5);

      // Detect price selector
      let priceSelector = '';
      for (const pattern of pricePatterns) {
        const firstContainer = sampleContainers[0];
        if (firstContainer.querySelector(pattern)) {
          priceSelector = pattern;
          break;
        }
      }

      // If no price found, look for text containing currency symbols
      if (!priceSelector) {
        const priceEl = sampleContainers[0]?.querySelector(
          '*:not(script):not(style)'
        );
        if (priceEl) {
          const walker = document.createTreeWalker(
            sampleContainers[0],
            NodeFilter.SHOW_TEXT
          );
          while (walker.nextNode()) {
            const text = walker.currentNode.textContent || '';
            if (text.match(/[₹$£€]\s*[\d,]+|Rs\.?\s*[\d,]+/)) {
              const parent = walker.currentNode.parentElement;
              if (parent) {
                const classes = parent.className;
                if (classes) {
                  priceSelector = `.${classes.split(' ')[0]}`;
                  break;
                }
              }
            }
          }
        }
      }

      // Detect product name (usually h2, h3, h4, or .title, .name)
      const namePatterns = [
        'h2',
        'h3',
        'h4',
        '.product-title',
        '.product-name',
        '.title',
        '.name',
        'a[class*="title"]',
        'span[class*="title"]',
      ];

      let nameSelector = '';
      for (const pattern of namePatterns) {
        const firstContainer = sampleContainers[0];
        const el = firstContainer.querySelector(pattern);
        if (el && el.textContent && el.textContent.trim().length > 5) {
          nameSelector = pattern;
          break;
        }
      }

      // Detect brand name (usually small text, .brand, .manufacturer, span near title)
      const brandPatterns = [
        '.brand',
        '.brand-name',
        '.manufacturer',
        '[class*="brand"]',
        'span[class*="brand"]',
        '.product-brand',
        'a[class*="brand"]',
      ];

      let brandSelector = '';
      for (const pattern of brandPatterns) {
        const firstContainer = sampleContainers[0];
        const el = firstContainer.querySelector(pattern);
        if (el && el.textContent && el.textContent.trim().length > 0) {
          brandSelector = pattern;
          break;
        }
      }

      // Detect image
      let imageSelector = 'img';
      const firstImg = sampleContainers[0]?.querySelector('img');
      if (firstImg && firstImg.className) {
        imageSelector = `img.${firstImg.className.split(' ')[0]}`;
      }

      // Detect product URL (usually an <a> tag wrapping the container or inside it)
      let urlSelector = 'a';
      const firstLink = sampleContainers[0]?.querySelector('a[href*="product"], a[href*="item"]');
      if (firstLink && firstLink.className) {
        urlSelector = `a.${firstLink.className.split(' ')[0]}`;
      }

      // Calculate confidence score
      let confidence = 0;
      if (bestCount >= 5) confidence += 30;
      else if (bestCount >= 3) confidence += 20;
      if (priceSelector) confidence += 25;
      if (nameSelector) confidence += 20;
      if (brandSelector) confidence += 15;
      if (imageSelector) confidence += 10;

      return {
        productContainer: bestContainer,
        productName: nameSelector || 'h3, h4, .title',
        productBrand: brandSelector || '.brand, span',
        productPrice: priceSelector || '.price',
        productImage: imageSelector,
        productUrl: urlSelector || 'a',
        confidence,
        detectedProductCount: bestCount,
      };
    });

    console.log(`✅ Auto-detection result:`, detected);

    return detected;
  } catch (error: any) {
    console.error(`❌ Error auto-detecting selectors:`, error.message);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}
