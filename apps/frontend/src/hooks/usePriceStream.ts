import { useEffect, useState } from 'react';
import { Asset } from '@/types';

export function usePriceStream(token: string | null) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Open SSE connection
    // We pass token as query param because SSE doesn't support custom headers
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const eventSource = new EventSource(`${apiUrl}/assets/stream?token=${token}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const prices: Asset[] = JSON.parse(event.data);
        setAssets(prices);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    // Close connection when component unmounts
    return () => {
      eventSource.close();
    };
  }, [token]);

  return { assets, isConnected };
}