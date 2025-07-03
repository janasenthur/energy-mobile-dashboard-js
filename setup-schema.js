const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

const { pool } = require('./backend/config/database');
const logger = require('./backend/utils/logger');

async function createSchema() {
  const client = await pool.connect();
  
  try {
    logger.info('🔧 Creating database schema...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await client.query(sql);

    logger.info('✅ Database schema created successfully!');

    // Now create test users
    logger.info('👤 Creating test users...');
    
    const bcrypt = require('./backend/node_modules/bcryptjs');
    
    const testUsers = [
      { email: 'admin@nbs.com', password: 'admin123', role: 'admin', first_name: 'Admin', last_name: 'User' },
      { email: 'driver@nbs.com', password: 'driver123', role: 'driver', first_name: 'Test', last_name: 'Driver' },
      { email: 'customer@nbs.com', password: 'customer123', role: 'customer', first_name: 'Test', last_name: 'Customer' },
      { email: 'dispatcher@nbs.com', password: 'dispatcher123', role: 'dispatcher', first_name: 'Test', last_name: 'Dispatcher' }
    ];

    for (const user of testUsers) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await client.query(`
          INSERT INTO users (email, password_hash, role, first_name, last_name, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (email) DO NOTHING
        `, [user.email, hashedPassword, user.role, user.first_name, user.last_name, 'active']);
        
        logger.info(`✅ Created user: ${user.email} / ${user.password}`);

        // Create related records
        if (user.role === 'customer') {
          await client.query(`
            INSERT INTO customers (user_id, company_name, business_type)
            SELECT id, 'Test Company', 'Energy Services'
            FROM users WHERE email = $1
            ON CONFLICT DO NOTHING
          `, [user.email]);
        } else if (user.role === 'driver') {
          await client.query(`
            INSERT INTO drivers (user_id, license_number, availability)
            SELECT id, 'DL123456789', 'available'
            FROM users WHERE email = $1
            ON CONFLICT DO NOTHING
          `, [user.email]);
        }
        
      } catch (err) {
        logger.warn(`User ${user.email} might already exist`);
      }
    }

    logger.info('🎉 Database setup completed successfully!');
    logger.info('📋 Test accounts created:');
    testUsers.forEach(user => {
      logger.info(`   ${user.role}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    logger.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

createSchema()
  .then(() => {
    logger.info('🚀 Ready to start your application!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Setup failed:', error);
    process.exit(1);
  });
