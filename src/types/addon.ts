// types/addon.ts
export type Addon = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
};
