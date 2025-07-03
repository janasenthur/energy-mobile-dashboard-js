const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const { query } = require('./backend/config/database');
const logger = require('./backend/utils/logger');

async function setupDatabase() {
  try {
    logger.info('🔧 Starting database setup...');

    // Read the main schema file
    const schemaPath = path.join(__dirname, 'database', 'energy_mobile_dashboard.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    logger.info('📋 Creating database schema...');
    
    // Split SQL into individual statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            logger.warn(`Warning executing SQL: ${err.message}`);
          }
        }
      }
    }

    logger.info('✅ Database schema created successfully');

    // Create default admin user
    logger.info('👤 Creating default admin user...');
    
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, ['admin@nbs.com', adminPassword, 'admin', 'Admin', 'User', 'active']);
      
      logger.info('✅ Default admin user created (admin@nbs.com / admin123)');
    } catch (err) {
      logger.warn('Admin user might already exist:', err.message);
    }

    // Create test users
    logger.info('👥 Creating test users...');
    
    const testUsers = [
      { email: 'driver@nbs.com', password: 'driver123', role: 'driver', first_name: 'Test', last_name: 'Driver' },
      { email: 'customer@nbs.com', password: 'customer123', role: 'customer', first_name: 'Test', last_name: 'Customer' },
      { email: 'dispatcher@nbs.com', password: 'dispatcher123', role: 'dispatcher', first_name: 'Test', last_name: 'Dispatcher' }
    ];

    for (const user of testUsers) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await query(`
          INSERT INTO users (email, password_hash, role, first_name, last_name, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (email) DO NOTHING
        `, [user.email, hashedPassword, user.role, user.first_name, user.last_name, 'active']);
        
        logger.info(`✅ Test user created: ${user.email} / ${user.password}`);
      } catch (err) {
        logger.warn(`Test user ${user.email} might already exist`);
      }
    }

    logger.info('🎉 Database setup completed successfully!');
    logger.info('📋 Test accounts:');
    logger.info('   Admin: admin@nbs.com / admin123');
    logger.info('   Driver: driver@nbs.com / driver123');
    logger.info('   Customer: customer@nbs.com / customer123');
    logger.info('   Dispatcher: dispatcher@nbs.com / dispatcher123');

  } catch (error) {
    logger.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
