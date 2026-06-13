export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
  count: number;
};
