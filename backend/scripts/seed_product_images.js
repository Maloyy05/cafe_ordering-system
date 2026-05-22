/**
 * Seed product.image_url values from the public images manifest.
 * Run: node backend/scripts/seed_product_images.js
 * Requires backend/.env to contain SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY.
 */
const path = require('path');
const fs = require('fs');
const supabase = require('../src/config/supabase');

async function main() {
  const manifestPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'products', 'images.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found at', manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const mapping = manifest.products || [];

  for (const item of mapping) {
    const name = item.name;
    const imageUrl = item.file;
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('name', name);

      if (error) {
        console.error('Failed to update', name, error.message || error);
      } else {
        console.log('Updated', name, '->', imageUrl);
      }
    } catch (err) {
      console.error('Error updating', name, err.message || err);
    }
  }

  console.log('Seeding complete');
  process.exit(0);
}

main();
