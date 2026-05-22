const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error querying categories:', error);
      return;
    }

    console.log('Categories in database:');
    console.log('=======================');
    if (data && data.length > 0) {
      data.forEach((category) => {
        console.log(`ID: ${category.id}, Name: ${category.name}`);
      });
    } else {
      console.log('No categories found');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

queryCategories();
