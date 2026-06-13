import { getRedis } from "./redis";
import { env } from "./env";
import type { CartItem, Cart } from "@/types/cart";

const CART_TTL = 60 * 60 * 24 * 30; // 30 days

function isRedisConfigured() {
  return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

export function cartKey(id: string, type: "user" | "guest") {
  return `cart:${type}:${id}`;
}

export async function getCart(key: string): Promise<Cart> {
  if (!isRedisConfigured()) return { items: [], total: 0, count: 0 };
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, string>>(key);
  if (!raw) return { items: [], total: 0, count: 0 };

  const items: CartItem[] = Object.values(raw).map((v) => JSON.parse(v) as CartItem);
  return buildCart(items);
}

export async function setCartItem(key: string, item: CartItem): Promise<void> {
  if (!isRedisConfigured()) return;
  const redis = getRedis();
  await redis.hset(key, { [item.productId]: JSON.stringify(item) });
  await redis.expire(key, CART_TTL);
}

export async function removeCartItem(key: string, productId: string): Promise<void> {
  if (!isRedisConfigured()) return;
  const redis = getRedis();
  await redis.hdel(key, productId);
}

export async function clearCart(key: string): Promise<void> {
  if (!isRedisConfigured()) return;
  const redis = getRedis();
  await redis.del(key);
}

export async function mergeGuestCart(guestKey: string, userKey: string): Promise<void> {
  if (!isRedisConfigured()) return;
  const redis = getRedis();
  const raw = await redis.hgetall<Record<string, string>>(guestKey);
  if (!raw) return;

  const guestItems: CartItem[] = Object.values(raw).map((v) => JSON.parse(v) as CartItem);

  for (const item of guestItems) {
    const existing = await redis.hget<string>(userKey, item.productId);
    if (existing) {
      const existingItem = JSON.parse(existing) as CartItem;
      const merged: CartItem = {
        ...existingItem,
        quantity: Math.min(existingItem.quantity + item.quantity, item.stock),
      };
      await redis.hset(userKey, { [item.productId]: JSON.stringify(merged) });
    } else {
      await redis.hset(userKey, { [item.productId]: JSON.stringify(item) });
    }
  }

  await redis.expire(userKey, CART_TTL);
  await redis.del(guestKey);
}

export function buildCart(items: CartItem[]): Cart {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, total, count };
}
