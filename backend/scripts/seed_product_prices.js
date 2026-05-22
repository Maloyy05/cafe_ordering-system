/**
 * Seed product prices for common products.
 * Usage:
 *   - Create or export SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment
 *   - Run: node backend/scripts/seed_product_prices.js
 *
 * The script updates products by name (case-insensitive) and sets `price`.
 */
const supabase = require('../src/config/supabase');

async function main() {
  const mapping = [
    { name: 'Cappuccino', price: 15000 },
    { name: 'Espresso', price: 12000 },
    { name: 'Americano', price: 11000 },
    { name: 'Cortado', price: 14000 },
    { name: 'Latte', price: 13000 },
    { name: 'Mocha', price: 16000 }
  ];

  for (const item of mapping) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ price: item.price })
        .ilike('name', item.name)
        .select();

      if (error) {
        console.error('Failed to update price for', item.name, error.message || error);
      } else if (data && data.length) {
        console.log(`Updated ${data.length} product(s) for '${item.name}' -> ${item.price}`);
      } else {
        console.log(`No product matched '${item.name}'`);
      }
    } catch (err) {
      console.error('Error updating', item.name, err.message || err);
    }
  }

  console.log('Price seeding complete');
  process.exit(0);
}

main();
