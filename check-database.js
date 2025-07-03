require('dotenv').config({ path: './backend/.env' });
const { query } = require('./backend/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const result = await query(tablesQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ No tables found in the database');
      console.log('💡 You need to create the database schema first');
    } else {
      console.log('✅ Found tables:');
      result.rows.forEach(row => {
        console.log('  📋', row.table_name);
      });
    }

    // Check if specific tables exist
    const requiredTables = ['users', 'customers', 'drivers', 'jobs', 'notifications'];
    console.log('\n🔍 Checking required tables:');
    
    for (const table of requiredTables) {
      const tableExists = result.rows.some(row => row.table_name === table);
      console.log(`  ${tableExists ? '✅' : '❌'} ${table}`);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();
