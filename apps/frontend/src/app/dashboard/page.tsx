'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi, portfolioApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Asset, Portfolio, Order } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Order form state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('1');
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'history'>('market');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await assetsApi.getAll();
      return res.data;
    },
    refetchInterval: 3000, // Refresh every 3 seconds to match backend
    enabled: !!user,
  });

  // Fetch portfolio
  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await portfolioApi.get();
      return res.data;
    },
    refetchInterval: 3000,
    enabled: !!user,
  });

  // Fetch order history
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await portfolioApi.getOrders();
      return res.data;
    },
    enabled: !!user,
  });

  // Place order mutation
  const placeMutation = useMutation({
    mutationFn: (data: { symbol: string; side: 'BUY' | 'SELL'; quantity: number }) =>
      portfolioApi.placeOrder(data),
    onSuccess: (res) => {
      const o = res.data.order;
      setOrderSuccess(`${o.side} ${o.quantity} ${o.symbol} @ $${o.price} — total $${o.total}`);
      setOrderError('');
      setQuantity('1');
      // Refresh portfolio and orders after trade
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      setOrderError(err.response?.data?.error || 'Order failed');
      setOrderSuccess('');
    },
  });

  const handleOrder = () => {
    if (!selectedAsset) return;
    setOrderError('');
    setOrderSuccess('');
    placeMutation.mutate({
      symbol: selectedAsset.symbol,
      side: orderSide,
      quantity: parseFloat(quantity),
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatPnl = (value: number) => {
    const formatted = formatCurrency(Math.abs(value));
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <span className="font-bold text-lg">Paper Trading</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hello, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Portfolio summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Cash Balance</p>
            <p className="text-2xl font-bold">
              {portfolioLoading ? '...' : formatCurrency(portfolio?.balance ?? 0)}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total Equity</p>
            <p className="text-2xl font-bold">
              {portfolioLoading ? '...' : formatCurrency(portfolio?.totalEquity ?? 0)}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Unrealized P&L</p>
            <p className={`text-2xl font-bold ${
              (portfolio?.totalUnrealizedPnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {portfolioLoading ? '...' : formatPnl(portfolio?.totalUnrealizedPnl ?? 0)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left: Tabs (Market / Portfolio / History) */}
          <div className="col-span-2">

            {/* Tab buttons */}
            <div className="flex gap-2 mb-4">
              {(['market', 'portfolio', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Market tab — list of all assets */}
            {activeTab === 'market' && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Symbol</th>
                      <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Name</th>
                      <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetsLoading ? (
                      <tr><td colSpan={3} className="text-center py-8 text-gray-400">Loading...</td></tr>
                    ) : (
                      assets.map((asset) => (
                        <tr
                          key={asset.symbol}
                          onClick={() => setSelectedAsset(asset)}
                          className={`border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                            selectedAsset?.symbol === asset.symbol ? 'bg-gray-800' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold">{asset.symbol}</td>
                          <td className="px-4 py-3 text-gray-400">{asset.name}</td>
                          <td className="px-4 py-3 text-right font-mono">
                            {formatCurrency(asset.price)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Portfolio tab — open positions */}
            {activeTab === 'portfolio' && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {portfolio?.positions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No open positions yet. Buy some stocks!
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Symbol</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Qty</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Avg Price</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Current</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio?.positions.map((pos) => (
                        <tr key={pos.id} className="border-b border-gray-800">
                          <td className="px-4 py-3 font-semibold">{pos.symbol}</td>
                          <td className="px-4 py-3 text-right">{pos.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(pos.avgPrice)}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(pos.currentPrice)}</td>
                          <td className={`px-4 py-3 text-right font-mono font-semibold ${
                            pos.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatPnl(pos.unrealizedPnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* History tab — order history */}
            {activeTab === 'history' && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No orders yet.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Symbol</th>
                        <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Side</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Qty</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Price</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Total</th>
                        <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-800">
                          <td className="px-4 py-3 font-semibold">{order.symbol}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.side === 'BUY'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-red-900/50 text-red-400'
                            }`}>
                              {order.side}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{order.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(order.price)}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(order.total)}</td>
                          <td className="px-4 py-3 text-right text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Right: Order panel */}
          <div className="col-span-1">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="font-semibold mb-4">Place Order</h3>

              {!selectedAsset ? (
                <p className="text-gray-400 text-sm">
                  Select a stock from the market tab to trade.
                </p>
              ) : (
                <div className="space-y-4">

                  {/* Selected asset info */}
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="font-semibold">{selectedAsset.symbol}</p>
                    <p className="text-gray-400 text-sm">{selectedAsset.name}</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(selectedAsset.price)}</p>
                  </div>

                  {/* BUY / SELL toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrderSide('BUY')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        orderSide === 'BUY'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setOrderSide('SELL')}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        orderSide === 'SELL'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Quantity input */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Quantity</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Order total */}
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Estimated Total</p>
                    <p className="font-bold text-lg">
                      {formatCurrency(selectedAsset.price * parseFloat(quantity || '0'))}
                    </p>
                  </div>

                  {/* Error / success messages */}
                  {orderError && (
                    <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-3 py-2 text-sm">
                      {orderError}
                    </div>
                  )}
                  {orderSuccess && (
                    <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg px-3 py-2 text-sm">
                      {orderSuccess}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    onClick={handleOrder}
                    disabled={placeMutation.isPending}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                      orderSide === 'BUY'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {placeMutation.isPending ? 'Processing...' : `${orderSide} ${selectedAsset.symbol}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}