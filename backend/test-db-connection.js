#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the database connection using the same configuration
 * as the main application. Run this before starting the server to verify
 * that the database is accessible.
 */

require('dotenv').config();
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

async function testDatabaseConnection() {
  logger.info('🔍 Testing database connection...');
  logger.info(`📋 Database Configuration:`);
  logger.info(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  logger.info(`   Port: ${process.env.DB_PORT || 5432}`);
  logger.info(`   Database: ${process.env.DB_NAME || 'energy_mobile_dashboard'}`);
  logger.info(`   User: ${process.env.DB_USER || 'postgres'}`);
  logger.info(`   SSL: ${process.env.DB_SSL === 'true' ? 'enabled' : 'disabled'}`);
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      logger.info('✅ Database connection test PASSED');
      logger.info('🚀 You can now start the backend server safely');
      process.exit(0);
    } else {
      logger.error('❌ Database connection test FAILED');
      logger.error('🔧 Please check your database configuration and ensure PostgreSQL is running');
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Database connection test ERROR:', error.message);
    logger.error('🔧 Common issues to check:');
    logger.error('   1. Is PostgreSQL running?');
    logger.error('   2. Are the database credentials correct?');
    logger.error('   3. Does the database exist?');
    logger.error('   4. Is the database accepting connections?');
    logger.error('   5. Are there any firewall/network issues?');
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
