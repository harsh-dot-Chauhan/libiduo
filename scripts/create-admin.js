#!/usr/bin/env node

/**
 * Script to create or reset an admin user
 * Usage: node scripts/create-admin.js <email> <password>
 * Example: node scripts/create-admin.js admin@example.com Admin123
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function createOrUpdateAdmin(email, password) {
  try {
    if (!email || !password) {
      console.error('❌ Error: Email and password are required');
      console.error('Usage: node scripts/create-admin.js <email> <password>');
      process.exit(1);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create or update the admin user
    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        role: 'ADMIN',
        name: 'Admin User',
      },
      update: {
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created/updated successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${user.role}`);
    console.log('\nYou can now login at http://localhost:3001/admin/login');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

createOrUpdateAdmin(email, password);
