#!/usr/bin/env node

/**
 * Auto-creates an admin user on deployment if one does not already exist.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment / .env file.
 * Run: node scripts/create-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const existing = await db.user.findUnique({ where: { email } });

    if (existing) {
      await db.user.update({
        where: { email },
        data: { passwordHash, role: 'ADMIN' },
      });
      console.log(`✅ Admin user updated: ${email}`);
    } else {
      await db.user.create({
        data: { email, passwordHash, role: 'ADMIN', name: 'Admin' },
      });
      console.log(`✅ Admin user created: ${email}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

ensureAdmin();
