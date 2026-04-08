export interface User {
    id: string;
    email: string;
    name: string;
  }
  
  export interface Asset {
    symbol: string;
    name: string;
    price: number;
    updatedAt: string;
  }
  
  export interface Position {
    id: string;
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnl: number;
  }
  
  export interface Portfolio {
    balance: number;
    totalEquity: number;
    totalUnrealizedPnl: number;
    positions: Position[];
  }
  
  export interface Order {
    id: string;
    symbol: string;
    name: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total: number;
    status: string;
    createdAt: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }