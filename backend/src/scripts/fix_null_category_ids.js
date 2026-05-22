/**
 * Migration script to fix products with NULL category_id
 * This script attempts to match products to categories based on product names
 * Run this with: node fix_null_category_ids.js
 */

const supabase = require('../config/supabase');

const categoryMappings = {
  'coffee': 'Coffee',
  'espresso': 'Coffee',
  'cappuccino': 'Coffee',
  'cappucino': 'Coffee',
  'americano': 'Coffee',
  'latte': 'Coffee',
  'mocha': 'Coffee',
  'cortado': 'Coffee',
  'cookie': 'Cookies',
  'biscuit': 'Cookies',
  'pastry': 'Cookies',
};

async function fixNullCategoryIds() {
  try {
    console.log('Fetching products with NULL category_id...');
    const { data: productsWithNull, error: fetchError } = await supabase
      .from('products')
      .select('id, name, category_id')
      .is('category_id', null);

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }

    if (!productsWithNull || productsWithNull.length === 0) {
      console.log('✓ No products with NULL category_id found');
      return;
    }

    console.log(`Found ${productsWithNull.length} products with NULL category_id`);

    // Fetch all available categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name');

    if (catError || !categories) {
      console.error('Error fetching categories:', catError);
      return;
    }

    console.log(`Available categories: ${categories.map(c => c.name).join(', ')}`);

    let updated = 0;
    let skipped = 0;

    for (const product of productsWithNull) {
      const productName = product.name.toLowerCase();
      let matchedCategory = null;

      // Try to match product name with category mappings
      for (const [keyword, categoryName] of Object.entries(categoryMappings)) {
        if (productName.includes(keyword)) {
          matchedCategory = categories.find(c => c.name === categoryName);
          if (matchedCategory) break;
        }
      }

      if (!matchedCategory) {
        console.warn(`⚠ Could not find matching category for product: "${product.name}"`);
        skipped++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ category_id: matchedCategory.id })
        .eq('id', product.id);

      if (updateError) {
        console.error(`✗ Error updating product "${product.name}":`, updateError.message);
      } else {
        console.log(`✓ Updated "${product.name}" → ${matchedCategory.name}`);
        updated++;
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Updated: ${updated} products`);
    console.log(`Skipped: ${skipped} products`);
    console.log(`Total processed: ${updated + skipped}/${productsWithNull.length}`);

  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

fixNullCategoryIds();