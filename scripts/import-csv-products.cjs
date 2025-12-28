// scripts/import-csv-products.cjs
// Usage: node scripts/import-csv-products.cjs

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function importProducts() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  const products = [];
  fs.createReadStream(path.join(process.cwd(), 'products.csv'))
    .pipe(csv())
    .on('data', (row) => {
      const brand = row['BRAND NAME']?.trim() || '';
      const modelName = row['MODEL NAME']?.trim() || '';
      products.push({
        name: row['PRODUCT NAME']?.trim() || '',
        description: modelName,
        price: Number(row['MRP']) || 0,
        quantity: Number(row['NET QTY']) || 0,
        uom: '',
        brandName: brand,
        barcode: row['BARCODE']?.trim() || '',
        productCode: row['PRODUCT CODE']?.trim() || '',
        modelName: modelName,
        image: '',
        images: [],
        category: brand, // category is now brand name
        retailDiscount: 0,
        retailPrice: 0,
        discount: Number(row['DISCOUNT']) || 0,
        wholesalePrice: 0,
        superDiscount: 0,
        superWholesalePrice: 0,
        minRetailQuantity: 1,
        minWholesaleQuantity: 10,
        minSuperWholesaleQuantity: 50,
        mrp: Number(row['MRP']) || 0,
        stockThreshold: 10,
      });
    })
    .on('end', async () => {
      await Product.deleteMany({});
      await Product.insertMany(products);
      console.log(`Imported ${products.length} products from CSV.`);
      await mongoose.disconnect();
    });
}

importProducts().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
