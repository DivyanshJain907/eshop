// scripts/update-uom-from-csv.cjs
// Usage: node scripts/update-uom-from-csv.cjs
// This script updates UOM for existing products based on product names and types

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Function to determine UOM based on product name and type
function determineUOM(productName, netQty) {
  const name = productName?.toLowerCase() || '';
  
  // Set based on product names/keywords
  if (name.includes('set') || name.includes('combo')) {
    return 'Set';
  } else if (name.includes('pack')) {
    return 'Pack';
  } else if (name.includes('box')) {
    return 'Box';
  } else if (name.includes('piece') || name.includes('pc')) {
    return 'Pieces';
  } else if (name.includes('dozen')) {
    return 'EA'; // Each
  } else {
    // Default to Pieces for most kitchenware/tableware
    return 'Pieces';
  }
}

async function updateUOM() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const csvData = [];
    
    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(process.cwd(), 'products.csv'))
        .pipe(csv())
        .on('data', (row) => {
          csvData.push({
            barcode: row['BARCODE']?.trim() || '',
            productName: row['PRODUCT NAME']?.trim() || '',
            netQty: row['NET QTY']?.trim() || '',
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Loaded ${csvData.length} products from CSV`);

    let updated = 0;
    let skipped = 0;

    // Update each product in database
    for (const csvProduct of csvData) {
      if (!csvProduct.barcode || !csvProduct.productName) continue;

      const dbProduct = await Product.findOne({ barcode: csvProduct.barcode });
      if (!dbProduct) {
        skipped++;
        continue;
      }

      const newUOM = determineUOM(csvProduct.productName, csvProduct.netQty);
      
      if (dbProduct.uom !== newUOM) {
        await Product.updateOne(
          { _id: dbProduct._id },
          { uom: newUOM }
        );
        updated++;
        console.log(`✅ Updated: ${csvProduct.productName} → UOM: ${newUOM}`);
      }
    }

    console.log(`\n📈 Update Summary:`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Skipped: ${skipped} products (not found or no barcode)`);
    console.log(`   Total processed: ${csvData.length}`);

    await mongoose.disconnect();
    console.log('\n✅ UOM update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating UOM:', error);
    process.exit(1);
  }
}

updateUOM();
