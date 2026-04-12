'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePortfolio } from '@/hooks/usePortfolio';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/dashboard/Navbar';
import StatsCards from '@/components/dashboard/StatsCards';
import AssetTable from '@/components/dashboard/AssetTable';
import PositionsTable from '@/components/dashboard/PositionsTable';
import OrderHistory from '@/components/dashboard/OrderHistory';
import OrderPanel from '@/components/dashboard/OrderPanel';

type Tab = 'market' | 'portfolio' | 'history';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('market');

  const {
    assets, portfolio, orders,
    isConnected, assetsLoading, portfolioLoading,
    selectedAsset, setSelectedAsset,
    orderSide, setOrderSide,
    quantity, setQuantity,
    orderError, orderSuccess,
    handleOrder, isPlacing,
  } = usePortfolio(token);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">

        <Navbar user={user} isConnected={isConnected} onLogout={handleLogout} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

          <StatsCards portfolio={portfolio} isLoading={portfolioLoading} />

          {/* Mobile: order panel on top when asset selected */}
          {selectedAsset && (
            <div className="block md:hidden mb-6">
              <OrderPanel
                selectedAsset={selectedAsset}
                orderSide={orderSide}
                quantity={quantity}
                orderError={orderError}
                orderSuccess={orderSuccess}
                isPlacing={isPlacing}
                onSideChange={setOrderSide}
                onQuantityChange={setQuantity}
                onOrder={handleOrder}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left: Tabs */}
            <div className="md:col-span-2">

              {/* Tab buttons */}
              <div className="flex gap-2 mb-4">
                {(['market', 'portfolio', 'history'] as Tab[]).map((tab) => (
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

              {activeTab === 'market' && (
                <AssetTable
                  assets={assets}
                  isLoading={assetsLoading}
                  selectedSymbol={selectedAsset?.symbol ?? null}
                  onSelect={setSelectedAsset}
                />
              )}
              {activeTab === 'portfolio' && (
                <PositionsTable positions={portfolio?.positions} />
              )}
              {activeTab === 'history' && (
                <OrderHistory orders={orders} />
              )}
            </div>

            {/* Right: Order panel — hidden on mobile (shown above instead) */}
            <div className="hidden md:block md:col-span-1">
              <OrderPanel
                selectedAsset={selectedAsset}
                orderSide={orderSide}
                quantity={quantity}
                orderError={orderError}
                orderSuccess={orderSuccess}
                isPlacing={isPlacing}
                onSideChange={setOrderSide}
                onQuantityChange={setQuantity}
                onOrder={handleOrder}
              />
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}