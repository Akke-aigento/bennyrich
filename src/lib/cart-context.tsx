import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearCartId,
  ensureCartId,
  fetchCart,
  getStoredCartId,
  normalizeCart,
  sellqoFetch,
  type SellqoCart,
  type SellqoCartItem,
} from "./sellqo";

type CartCtx = {
  cart: SellqoCart | null;
  items: SellqoCartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (v: boolean) => void;
  refresh: () => Promise<void>;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  resetLocal: () => void;
};

const Ctx = createContext<CartCtx>({
  cart: null,
  items: [],
  count: 0,
  subtotal: 0,
  hydrated: false,
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  setOpen: () => {},
  refresh: async () => {},
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  resetLocal: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<SellqoCart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const applyRaw = useCallback((raw: any) => {
    const c = normalizeCart(raw);
    if (c) setCart(c);
    return c;
  }, []);

  const refresh = useCallback(async () => {
    const c = await fetchCart();
    setCart(c);
    setHydrated(true);
  }, []);

  const addItem = useCallback(
    async (productId: string, variantId?: string, quantity = 1) => {
      const cartId = await ensureCartId();
      const res = await sellqoFetch<any>(`/cart/${cartId}/items`, {
        method: "POST",
        body: {
          product_id: productId,
          variant_id: variantId,
          quantity,
        },
      });
      if (!applyRaw(res)) await refresh();
    },
    [applyRaw, refresh],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      const cartId = getStoredCartId();
      if (!cartId) return;
      const res = await sellqoFetch<any>(`/cart/${cartId}/items/${itemId}`, {
        method: "PUT",
        body: { quantity },
      });
      if (!applyRaw(res)) await refresh();
    },
    [applyRaw, refresh],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const cartId = getStoredCartId();
      if (!cartId) return;
      const res = await sellqoFetch<any>(`/cart/${cartId}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!applyRaw(res)) await refresh();
    },
    [applyRaw, refresh],
  );

  const clear = useCallback(async () => {
    const cartId = getStoredCartId();
    if (!cartId) return;
    try {
      await sellqoFetch<any>(`/cart/${cartId}`, { method: "DELETE" });
    } catch {
      /* ignore */
    }
    clearCartId();
    setCart(null);
  }, []);

  const resetLocal = useCallback(() => {
    clearCartId();
    setCart(null);
  }, []);

  useEffect(() => {
    refresh().catch(() => setHydrated(true));
  }, [refresh]);

  const value = useMemo<CartCtx>(
    () => ({
      cart,
      items: cart?.items ?? [],
      count: cart?.item_count ?? 0,
      subtotal: cart?.subtotal ?? 0,
      hydrated,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      setOpen: setIsOpen,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
      resetLocal,
    }),
    [cart, hydrated, isOpen, refresh, addItem, updateItem, removeItem, clear, resetLocal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  return useContext(Ctx);
}