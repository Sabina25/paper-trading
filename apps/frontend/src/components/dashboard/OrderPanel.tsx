import { Asset } from '@/types';

interface Props {
  selectedAsset: Asset | null;
  orderSide: 'BUY' | 'SELL';
  quantity: string;
  orderError: string;
  orderSuccess: string;
  isPlacing: boolean;
  onSideChange: (side: 'BUY' | 'SELL') => void;
  onQuantityChange: (qty: string) => void;
  onOrder: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function OrderPanel({
  selectedAsset, orderSide, quantity,
  orderError, orderSuccess, isPlacing,
  onSideChange, onQuantityChange, onOrder,
}: Props) {
  return (
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
              onClick={() => onSideChange('BUY')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                orderSide === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => onSideChange('SELL')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                orderSide === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Quantity</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Estimated total */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Estimated Total</p>
            <p className="font-bold text-lg">
              {formatCurrency(selectedAsset.price * parseFloat(quantity || '0'))}
            </p>
          </div>

          {/* Messages */}
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

          {/* Submit */}
          <button
            onClick={onOrder}
            disabled={isPlacing}
            className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
              orderSide === 'BUY'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isPlacing ? 'Processing...' : `${orderSide} ${selectedAsset.symbol}`}
          </button>
        </div>
      )}
    </div>
  );
}