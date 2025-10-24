export type UserRole = "CUSTOMER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderItemData {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string | null;
  };
}

export interface OrderData {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax: number;
  pickupTime: Date | null;
  qrCode: string | null;
  qrCodeScanned: boolean;
  qrCodeScannedAt: Date | null;
  createdAt: Date;
  items: OrderItemData[];
  user: {
    name: string | null;
    email: string;
  };
}

export interface ProductWithCategory {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  topProduct: string;
  ordersChange: number;
  revenueChange: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  icon: string;
}
