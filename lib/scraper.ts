import type { Browser, Page, LaunchOptions } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'node:fs';
import CompetitorConfig from './models/CompetitorConfig';
import ComparisonCache from './models/ComparisonCache';

export interface ScrapedProduct {
  name: string;
  brandName: string;
  price: number;
  priceText: string;
  image: string;
  url?: string;
  competitor: string;
}

export interface CompetitorSelectors {
  productContainer: string;
  productName: string;
  productBrand: string;
  productPrice: string;
  productImage: string;
  productUrl?: string;
}

export interface CompetitorConfigType {
  name: string;
  baseUrl: string;
  searchUrl: string;
  selectors: CompetitorSelectors;
  maxResults: number;
  timeout: number;
  isActive: boolean;
}

/**
 * Launch a headless browser instance
 */
async function launchBrowser(): Promise<Browser> {
  const isVercel = !!process.env.VERCEL;
  let launchOptions: LaunchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--window-size=1920,1080',
    ],
    timeout: 120000,
  };

  if (isVercel) {
    const executablePath = await chromium.executablePath();
    console.log(`🔧 Using Chromium at: ${executablePath}`);
    launchOptions = {
      ...launchOptions,
      executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
    };
  } else {
    const envExecutablePath = process.env.CHROME_EXECUTABLE_PATH || undefined;
    if (envExecutablePath) {
      console.log(`🔧 Using Chrome at: ${envExecutablePath}`);
      launchOptions = { ...launchOptions, executablePath: envExecutablePath };
    } else {
      const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      ];
      const found = candidates.find((p) => fs.existsSync(p));
      if (!found) {
        throw new Error('Chrome executable not found. Set CHROME_EXECUTABLE_PATH env var.');
      }
      console.log(`🔧 Using Chrome at: ${found}`);
      launchOptions = { ...launchOptions, executablePath: found };
    }
  }

  return await puppeteer.launch(launchOptions);
}

/**
 * Extract price from text (handles various formats)
 */
function extractPrice(priceText: string): number {
  if (!priceText) return 0;
  
  // Remove currency symbols and commas, extract numbers
  const cleaned = priceText.replace(/[₹$,\s]/g, '');
  const match = cleaned.match(/[\d.]+/);
  
  return match ? parseFloat(match[0]) : 0;
}

function collectProductsFromJson(data: any, competitorName: string, baseUrl: string): any[] {
  if (!data) return [];
  const results: any[] = [];
  const seen = new Set<string>();

  const getFirstString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return getFirstString(val[0]);
    if (typeof val === 'object') {
      return getFirstString(val.url || val.src || val.path || val.link || val.image || val.thumbnail);
    }
    return '';
  };

  const getPriceText = (obj: any): string => {
    const priceVal = obj.price ?? obj.sellingPrice ?? obj.selling_price ?? obj.salePrice ?? obj.sale_price ?? obj.mrp ?? obj.listPrice ?? obj.list_price;
    if (priceVal === undefined || priceVal === null) return '';
    const num = String(priceVal).replace(/[₹,\s]/g, '').match(/[\d.]+/);
    return num ? `₹${num[0]}` : '';
  };

  const getName = (obj: any): string => {
    return (obj.name || obj.title || obj.productName || obj.product_name || '').toString().trim();
  };

  const getUrl = (obj: any): string => {
    const raw = obj.url || obj.seoUrl || obj.seo_url || obj.slug || obj.handle || '';
    if (!raw || typeof raw !== 'string') return '';
    if (raw.startsWith('http')) return raw;
    if (raw.startsWith('/')) return `${baseUrl}${raw}`;
    return `${baseUrl}/products/${raw}`;
  };

  const isProductLike = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    const name = getName(obj);
    const priceText = getPriceText(obj);
    const image = getFirstString(obj.image || obj.images || obj.thumbnail || obj.media || obj.mainImage);
    return !!(name && image && priceText);
  };

  const visit = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== 'object') return;

    if (isProductLike(node)) {
      const name = getName(node);
      const image = getFirstString(node.image || node.images || node.thumbnail || node.media || node.mainImage);
      const priceText = getPriceText(node) || 'Price not available';
      const url = getUrl(node);

      const key = url || `${name}-${image}`;
      if (!seen.has(key) && name.length > 2 && image && !image.includes('data:image')) {
        seen.add(key);
        results.push({
          name,
          brandName: '',
          priceText,
          image,
          url,
          competitor: competitorName,
        });
      }
    }

    Object.values(node).forEach(visit);
  };

  visit(data);
  return results;
}

/**
 * Scrape all active competitors in parallel
 */
export async function scrapeAllCompetitors(searchQuery: string): Promise<ScrapedProduct[]> {
  let browser: Browser | null = null;

  try {
    // Get all active competitor configurations
    const configs = await CompetitorConfig.find({ isActive: true });

    if (configs.length === 0) {
      console.log('⚠️ No active competitors configured');
      return [];
    }

    // Debug: Log what configs we got from database
    console.log('📊 Loaded configs from database:');
    configs.forEach(c => {
      console.log(`  - ${c.name}: ${c.searchUrl}`);
    });

    // Launch a single shared browser instance
    browser = await launchBrowser();

    // Scrape all competitors sequentially using the shared browser
    const allProducts: ScrapedProduct[] = [];

    for (const config of configs) {
      try {
        const products = await scrapeCompetitorWithBrowser(browser, config.toObject(), searchQuery);
        allProducts.push(...products);
      } catch (error: any) {
        console.error(`❌ Error scraping ${config.name}:`, error.message);
      }
    }

    console.log(`✅ Total products scraped: ${allProducts.length}`);

    return allProducts;
  } catch (error: any) {
    console.error('❌ Error scraping competitors:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Scrape products using an existing browser instance
 */
async function scrapeCompetitorWithBrowser(
  browser: Browser,
  config: CompetitorConfigType,
  searchQuery: string
): Promise<ScrapedProduct[]> {
  let page: Page | null = null;

  try {
    console.log(`🔍 Scraping ${config.name} for "${searchQuery}"...`);

    page = await browser.newPage();

    await page.setBypassCSP(true);

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Build search URL
    let searchUrl = config.searchUrl;
    const encodedQuery = encodeURIComponent(searchQuery);
    if (searchUrl.includes('{query}')) {
      searchUrl = searchUrl.replace('{query}', encodedQuery);
    } else if (/\bq=/.test(searchUrl)) {
      // Keep existing q param value if already present
      const urlObj = new URL(searchUrl);
      if (!urlObj.searchParams.get('q')) {
        urlObj.searchParams.set('q', encodedQuery);
        searchUrl = urlObj.toString();
      }
    } else {
      // Append query param if missing
      const urlObj = new URL(searchUrl);
      urlObj.searchParams.set('q', encodedQuery);
      searchUrl = urlObj.toString();
    }
    const normalizeSearchUrl = (url: string) => url.replace(/catalogseaarch/gi, 'catalogsearch');
    searchUrl = normalizeSearchUrl(searchUrl);
    const isJaypee = /jaypeeplus\.com/i.test(searchUrl) || /jaypeeplus\.com/i.test(config.baseUrl);
    const isBorosil = /myborosil\.com/i.test(searchUrl) || /myborosil\.com/i.test(config.baseUrl);
    const baseUrlUsed = config.baseUrl;

    console.log(`🔧 Using competitor config: ${config.name}`);
    console.log(`🔧 Search URL: ${searchUrl}`);

    const networkProducts: any[] = [];
    const networkSeen = new Set<string>();

    const addNetworkProducts = (data: any) => {
      const items = collectProductsFromJson(data, config.name, config.baseUrl);
      items.forEach((p) => {
        const key = p.url || `${p.name}-${p.image}`;
        if (networkSeen.has(key)) return;
        networkSeen.add(key);
        networkProducts.push(p);
      });
    };

    if (isBorosil) {
      page.on('response', async (response) => {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (!contentType.includes('application/json')) return;
          const url = response.url();
          if (!/search|catalog|product|listing|collection|graphql/i.test(url)) return;
          const json = await response.json().catch(() => null);
          if (!json) return;
          addNetworkProducts(json);
        } catch {
          return;
        }
      });
    }

    const addOrUpdateQueryParam = (url: string, key: string, value: string) => {
      const parsed = new URL(url);
      parsed.searchParams.set(key, value);
      return parsed.toString();
    };

    const extractProductsFromPage = async () => {
      console.log('🔄 Starting product extraction...');
      return await page!.evaluate(
      (competitorName) => {
        const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        const results: any[] = [];
        const seenUrls = new Set<string>();

        links.forEach(link => {
          try {
            const href = link.href || '';
            
            // Skip if already processed
            if (seenUrls.has(href)) return;
            
            // Skip category/navigation pages
            const skipPatterns = /(^\/$|#$|javascript:|mailto:|login|register|cart|checkout|account|search|contact|privacy|terms|category|categories|collection|collections|blog|news|compare|wishlist|pages|about|brand|store|warranty)/i;
            if (skipPatterns.test(href) || href.length < 20) return;
            
            // Must have an image inside the link
            const img = link.querySelector('img');
            if (!img) return;
            
            // Walk up to find the smallest reasonable container with a price
            let container: Element | null = link;
            let chosen: Element | null = null;
            
            for (let i = 0; i < 8; i++) {
              if (!container) break;
              const text = container.textContent || '';
              const priceMatches = text.match(/₹[\s]*([\d,]+)/g) || [];
              const imageCount = container.querySelectorAll('img').length;
              const linkCount = container.querySelectorAll('a[href]').length;
              const textLength = text.replace(/\s+/g, ' ').trim().length;
              const hasPrice = priceMatches.length > 0;

              if (hasPrice && imageCount <= 5 && linkCount <= 10 && textLength > 0 && textLength < 2000) {
                chosen = container;
                break;
              }
              container = container.parentElement;
            }
            
            // Only include if it has a price in a compact container (actual product, not page-level)
            if (!chosen) return;

            container = chosen;

            seenUrls.add(href);

            // Extract image
            let image = '';
            if (img) {
              image = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
              // Handle srcset
              if (!image && img.srcset) {
                const srcsetParts = img.srcset.split(',')[0].trim().split(' ');
                image = srcsetParts[0];
              }
            }
            if (!image || image.includes('data:image')) return;

            // Extract name - try multiple strategies
            let name = '';
            
            // Strategy 1: Image alt text (most reliable for products)
            if (img?.alt && img.alt.length > 3 && img.alt.length < 200) {
              name = img.alt.trim();
            }
            
            // Strategy 2: Look for product title/name elements in container
            if (!name) {
              const titleSelectors = [
                '[class*="title"]',
                '[class*="name"]', 
                '[class*="product-name"]',
                '.product-item-name',
                'h1', 'h2', 'h3', 'h4'
              ];
              
              for (const selector of titleSelectors) {
                const el = container.querySelector(selector);
                if (el) {
                  const text = (el as HTMLElement).innerText?.trim();
                  if (text && text.length > 3 && text.length < 200 && !text.includes('₹') && !text.includes('{')) {
                    name = text;
                    break;
                  }
                }
              }
            }
            
            // Strategy 3: Link title attribute
            if (!name && link.title && link.title.length > 3 && link.title.length < 200) {
              name = link.title.trim();
            }
            
            if (!name || name.length < 3 || name.length > 200) return;
            
            // Skip if name looks like code/CSS/JavaScript
            if (name.includes('{') || name.includes('}') || name.includes('.product') || name.includes('var ') || name.includes('function') || name.includes('document.')) return;

            // Extract price
            let priceText = '';
            const containerText = container.textContent || '';
            const priceMatch = containerText.match(/₹[\s]*([\d,]+)/);
            if (priceMatch) {
              priceText = '₹' + priceMatch[1].replace(/,/g, '');
            }

            results.push({
              name,
              brandName: '',
              priceText: priceText || 'Price not available',
              image,
              url: href,
              competitor: competitorName,
            });
          } catch (err) {
            console.error('Error extracting product:', err);
          }
        });

        console.log(`✅ Extracted ${results.length} unique products`);
        return results;
      },
      config.name
      );
    };

    const extractProductsFromNextData = async () => {
      const data = await page!.evaluate(() => (window as any).__NEXT_DATA__ || null);
      return collectProductsFromJson(data, config.name, baseUrlUsed);
    };

    let products: any[] = [];

    if (isJaypee || isBorosil) {
      const siteName = isJaypee ? 'Jaypee' : 'Borosil';
      const pageParam = isJaypee ? 'p' : 'page';
      console.log(`📄 Detected ${siteName} search; using pagination to fetch all pages...`);
      const seen = new Set<string>();
      const maxPages = isJaypee ? 20 : 30;
      const navTimeout = Math.max(config.timeout || 0, 60000);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const pagedUrl = normalizeSearchUrl(addOrUpdateQueryParam(searchUrl, pageParam, String(pageNum)));
        console.log(`📍 Navigating to: ${pagedUrl}`);
        try {
          await page.goto(pagedUrl, {
            waitUntil: 'domcontentloaded',
            timeout: navTimeout,
          });

          await new Promise(resolve => setTimeout(resolve, 3000));

          let pageTitle = await page.title();
          console.log(`📄 Page loaded: ${pageTitle}`);

          if (isBorosil && /just a moment|checking your browser/i.test(pageTitle)) {
            await new Promise(resolve => setTimeout(resolve, 8000));
            pageTitle = await page.title();
            console.log(`⏳ Retry after challenge: ${pageTitle}`);
            if (/just a moment|checking your browser/i.test(pageTitle)) {
              break;
            }
          }

          const extraScrolls = isBorosil ? 5 : 1;
          for (let i = 0; i < extraScrolls; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await new Promise(resolve => setTimeout(resolve, 1500));
          }

          const pageProducts = await extractProductsFromPage();
          const nextDataProducts = isBorosil ? await extractProductsFromNextData() : [];
          const combinedProducts = [...pageProducts, ...nextDataProducts, ...networkProducts];
          const beforeCount = products.length;

          combinedProducts.forEach((p: any) => {
            const key = p.url || `${p.name}-${p.image}`;
            if (seen.has(key)) return;
            seen.add(key);
            products.push(p);
          });

          console.log(`📄 Page ${pageNum}: +${products.length - beforeCount} products (total ${products.length})`);

          if (products.length === beforeCount || combinedProducts.length === 0) {
            break;
          }
        } catch (err: any) {
          console.error(`⚠️ Page ${pageNum} failed: ${err?.message || err}`);
          break;
        }
      }
    } else {
      // Navigate to search page
      console.log(`📍 Navigating to: ${searchUrl}`);
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: config.timeout,
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Log page title for debugging
      const pageTitle = await page.title();
      console.log(`📄 Page loaded: ${pageTitle}`);

      // Scroll to load all lazy-loaded products
      console.log('📜 Scrolling to load all products...');
      let previousProductCount = 0;
      let scrollAttempts = 0;
      const maxScrollAttempts = 30;
      let noChangeCount = 0;

      while (scrollAttempts < maxScrollAttempts) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(resolve => setTimeout(resolve, 2500));

        const currentCount = await page.evaluate(() => {
          return document.querySelectorAll('a[href] img').length;
        });

        console.log(`  Scroll ${scrollAttempts + 1}: Found ${currentCount} images`);

        if (currentCount === previousProductCount) {
          noChangeCount++;
          if (noChangeCount >= 3) {
            console.log(`  No new products after ${noChangeCount} scrolls, stopping.`);
            break;
          }
        } else {
          noChangeCount = 0;
        }

        previousProductCount = currentCount;
        scrollAttempts++;
      }

      console.log(`✅ Finished scrolling. Total images visible: ${previousProductCount}`);

      products = await extractProductsFromPage();
    }

    console.log(`📊 Extraction complete: ${products.length} unique products extracted`);
    console.log(`   First product: ${products[0]?.name || 'NONE'}`);
    console.log(`   Last product: ${products[products.length - 1]?.name || 'NONE'}`);

    // Process results
    const processedProducts: ScrapedProduct[] = products
      .map((p) => ({
        name: p.name,
        brandName: p.brandName || '',
        price: extractPrice(p.priceText),
        priceText: p.priceText,
        image: p.image.startsWith('http') ? p.image : new URL(p.image, baseUrlUsed).href,
        url: p.url ? (p.url.startsWith('http') ? p.url : new URL(p.url, baseUrlUsed).href) : undefined,
        competitor: config.name,
      }));

    console.log(`✅ Found ${processedProducts.length} products from ${config.name}`);

    return processedProducts;
  } catch (error: any) {
    console.error(`❌ Error scraping ${config.name}:`, error.message);
    return [];
  } finally {
    if (page) {
      await page.close();
    }
  }
}


