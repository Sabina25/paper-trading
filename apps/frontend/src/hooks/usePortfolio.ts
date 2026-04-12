import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, assetsApi } from '@/lib/api';
import { Asset, Portfolio, Order } from '@/types';
import { usePriceStream } from './usePriceStream';

export function usePortfolio(token: string | null) {
  const queryClient = useQueryClient();
  const { assets: streamAssets, isConnected } = usePriceStream(token);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('1');
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const { data: fetchedAssets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => (await assetsApi.getAll()).data,
    enabled: !!token,
    staleTime: Infinity,
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Portfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => (await portfolioApi.get()).data,
    refetchInterval: 3000,
    enabled: !!token,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => (await portfolioApi.getOrders()).data,
    enabled: !!token,
  });

  const placeMutation = useMutation({
    mutationFn: (data: { symbol: string; side: 'BUY' | 'SELL'; quantity: number }) =>
      portfolioApi.placeOrder(data),
    onSuccess: (res) => {
      const o = res.data.order;
      setOrderSuccess(`${o.side} ${o.quantity} ${o.symbol} @ $${o.price} — total $${o.total}`);
      setOrderError('');
      setQuantity('1');
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

  const assets = streamAssets.length > 0 ? streamAssets : fetchedAssets;

  return {
    // Data
    assets, portfolio, orders,
    isConnected, assetsLoading, portfolioLoading,
    // Order form
    selectedAsset, setSelectedAsset,
    orderSide, setOrderSide,
    quantity, setQuantity,
    orderError, orderSuccess,
    handleOrder,
    isPlacing: placeMutation.isPending,
  };
}