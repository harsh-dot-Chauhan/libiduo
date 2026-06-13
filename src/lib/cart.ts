import { getRedis } from "./redis";
import { env } from "./env";
import { db } from "./db";
import type { CartItem, Cart } from "@/types/cart";

const CART_TTL = 60 * 60 * 24 * 30; // 30 days

function isRedisConfigured() {
  return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

export function cartKey(id: string, type: "user" | "guest") {
  return `cart:${type}:${id}`;
}

// ─── DB-backed fallback ───────────────────────────────────────────────────────

async function dbGetCart(key: string): Promise<Cart> {
  const row = await db.cartSession.findUnique({ where: { key } });
  if (!row) return { items: [], total: 0, count: 0 };
  const items: CartItem[] = JSON.parse(row.items);
  return buildCart(items);
}

async function dbSetItem(key: string, item: CartItem): Promise<void> {
  const row = await db.cartSession.findUnique({ where: { key } });
  const items: CartItem[] = row ? JSON.parse(row.items) : [];
  const idx = items.findIndex((i) => i.productId === item.productId);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  await db.cartSession.upsert({
    where: { key },
    create: { key, items: JSON.stringify(items) },
    update: { items: JSON.stringify(items) },
  });
}

async function dbRemoveItem(key: string, productId: string): Promise<void> {
  const row = await db.cartSession.findUnique({ where: { key } });
  if (!row) return;
  const items: CartItem[] = JSON.parse(row.items);
  const next = items.filter((i) => i.productId !== productId);
  if (next.length === 0) {
    await db.cartSession.delete({ where: { key } }).catch(() => {});
  } else {
    await db.cartSession.update({ where: { key }, data: { items: JSON.stringify(next) } });
  }
}

async function dbClearCart(key: string): Promise<void> {
  await db.cartSession.delete({ where: { key } }).catch(() => {});
}

async function dbMergeGuestCart(guestKey: string, userKey: string): Promise<void> {
  const guestRow = await db.cartSession.findUnique({ where: { key: guestKey } });
  if (!guestRow) return;
  const guestItems: CartItem[] = JSON.parse(guestRow.items);
  const userRow = await db.cartSession.findUnique({ where: { key: userKey } });
  const userItems: CartItem[] = userRow ? JSON.parse(userRow.items) : [];

  for (const item of guestItems) {
    const idx = userItems.findIndex((i) => i.productId === item.productId);
    if (idx >= 0) {
      userItems[idx] = { ...userItems[idx], quantity: Math.min(userItems[idx].quantity + item.quantity, item.stock) };
    } else {
      userItems.push(item);
    }
  }

  await db.cartSession.upsert({
    where: { key: userKey },
    create: { key: userKey, items: JSON.stringify(userItems) },
    update: { items: JSON.stringify(userItems) },
  });
  await db.cartSession.delete({ where: { key: guestKey } }).catch(() => {});
}

// ─── Redis-backed (primary) ───────────────────────────────────────────────────

async function redisGetCart(key: string): Promise<Cart> {
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, string>>(key);
  if (!raw) return { items: [], total: 0, count: 0 };
  const items: CartItem[] = Object.values(raw).map((v) => JSON.parse(v) as CartItem);
  return buildCart(items);
}

async function redisSetItem(key: string, item: CartItem): Promise<void> {
  const redis = getRedis();
  await redis.hset(key, { [item.productId]: JSON.stringify(item) });
  await redis.expire(key, CART_TTL);
}

async function redisRemoveItem(key: string, productId: string): Promise<void> {
  const redis = getRedis();
  await redis.hdel(key, productId);
}

async function redisClearCart(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

async function redisMergeGuestCart(guestKey: string, userKey: string): Promise<void> {
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, string>>(guestKey);
  if (!raw) return;
  const guestItems: CartItem[] = Object.values(raw).map((v) => JSON.parse(v) as CartItem);
  for (const item of guestItems) {
    const existing = await redis.hget<string>(userKey, item.productId);
    if (existing) {
      const existingItem = JSON.parse(existing) as CartItem;
      const merged: CartItem = { ...existingItem, quantity: Math.min(existingItem.quantity + item.quantity, item.stock) };
      await redis.hset(userKey, { [item.productId]: JSON.stringify(merged) });
    } else {
      await redis.hset(userKey, { [item.productId]: JSON.stringify(item) });
    }
  }
  await redis.expire(userKey, CART_TTL);
  await redis.del(guestKey);
}

// ─── Public API (auto-selects backend) ───────────────────────────────────────

export async function getCart(key: string): Promise<Cart> {
  return isRedisConfigured() ? redisGetCart(key) : dbGetCart(key);
}

export async function setCartItem(key: string, item: CartItem): Promise<void> {
  return isRedisConfigured() ? redisSetItem(key, item) : dbSetItem(key, item);
}

export async function removeCartItem(key: string, productId: string): Promise<void> {
  return isRedisConfigured() ? redisRemoveItem(key, productId) : dbRemoveItem(key, productId);
}

export async function clearCart(key: string): Promise<void> {
  return isRedisConfigured() ? redisClearCart(key) : dbClearCart(key);
}

export async function mergeGuestCart(guestKey: string, userKey: string): Promise<void> {
  return isRedisConfigured() ? redisMergeGuestCart(guestKey, userKey) : dbMergeGuestCart(guestKey, userKey);
}

export function buildCart(items: CartItem[]): Cart {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, total, count };
}
