const supabase = require('../config/supabase');

async function insertCategories() {
  try {
    console.log('Inserting categories...\n');
    
    const { data, error } = await supabase
      .from('categories')
      .insert([
        { name: 'Coffee' },
        { name: 'Cookies' }
      ])
      .select();

    if (error) {
      console.error('Error inserting categories:', error);
      return;
    }

    console.log('✓ Categories created successfully:\n');
    data.forEach(cat => {
      console.log(`  ID: ${cat.id}`);
      console.log(`  Name: ${cat.name}\n`);
    });

    console.log('✓ Ready to add products!');
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

insertCategories();
