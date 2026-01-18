const puppeteer = require('puppeteer');

async function testExtraction() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://myborosil.com/search?q=bottle', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Scroll once
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(resolve => setTimeout(resolve, 2000));

  const results = await page.evaluate(() => {
    const containers = document.querySelectorAll('.st-product-wrapper, [class*="product"], .product-item');
    console.log('Total containers:', containers.length);

    const extracted = [];
    
    for (let i = 0; i < containers.length; i++) {
      const item = containers[i];
      
      // Get ALL text
      const allText = item.textContent || '';
      
      // Try to find link with /products/
      const productLink = item.querySelector('a[href*="/products/"]');
      const linkText = productLink ? productLink.textContent?.trim() : null;
      
      // Try to find image
      const img = item.querySelector('img');
      const imgAlt = img ? img.alt : null;
      
      // Check for price
      const hasPrice = allText.includes('₹');
      
      extracted.push({
        index: i,
        linkText: linkText ? linkText.substring(0, 100) : 'NO LINK',
        imgAlt: imgAlt ? imgAlt.substring(0, 100) : 'NO IMG',
        hasPrice: hasPrice,
        textPreview: allText.substring(0, 150).replace(/\n/g, ' '),
      });
      
      if (i < 5 || i >= containers.length - 2) {
        console.log(`\nProduct ${i}:`, {
          linkText: linkText?.substring(0, 50),
          imgAlt: imgAlt?.substring(0, 50),
          hasPrice,
        });
      }
    }
    
    return extracted;
  });

  console.log(`\n✅ Total containers: ${results.length}`);
  console.log(`✅ With link text: ${results.filter(r => r.linkText !== 'NO LINK').length}`);
  console.log(`✅ With img alt: ${results.filter(r => r.imgAlt !== 'NO IMG').length}`);
  console.log(`✅ With price: ${results.filter(r => r.hasPrice).length}`);

  console.log('\n📋 First 3 products:');
  results.slice(0, 3).forEach((r, i) => {
    console.log(`\n${i + 1}.`);
    console.log('  Link:', r.linkText);
    console.log('  Alt:', r.imgAlt);
    console.log('  Price:', r.hasPrice ? 'YES' : 'NO');
  });

  await browser.close();
}

testExtraction();
