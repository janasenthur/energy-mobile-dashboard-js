const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'energy_mobile_dashboard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait when connecting
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool event handlers
pool.on('connect', () => {
  logger.info('🔗 New database client connected');
});

pool.on('error', (err) => {
  logger.error('❌ Unexpected error on idle database client:', err);
  process.exit(-1);
});

pool.on('remove', () => {
  logger.info('🔌 Database client removed from pool');
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    client.release();
    
    logger.info('✅ Database connection successful');
    logger.info(`📅 Server time: ${result.rows[0].now}`);
    logger.info(`🗄️  PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    return true;
  } catch (err) {
    logger.error('❌ Database connection failed:', err.message);
    return false;
  }
}

// Generic query function with error handling
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`🔍 Query executed in ${duration}ms:`, {
      query: text.slice(0, 100),
      rows: result.rowCount
    });
    
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error(`❌ Query failed after ${duration}ms:`, {
      query: text.slice(0, 100),
      error: err.message
    });
    throw err;
  }
}

// Transaction helper
async function transaction(callback) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Graceful shutdown
async function closePool() {
  try {
    await pool.end();
    logger.info('🔒 Database pool closed gracefully');
  } catch (err) {
    logger.error('❌ Error closing database pool:', err.message);
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};
