import { Asset } from '@/types';

interface Props {
  assets: Asset[];
  isLoading: boolean;
  selectedSymbol: string | null;
  onSelect: (asset: Asset) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function AssetTable({ assets, isLoading, selectedSymbol, onSelect }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Symbol</th>
            <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium hidden md:table-cell">Name</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Price</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-400">Loading...</td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr
                key={asset.symbol}
                onClick={() => onSelect(asset)}
                className={`border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedSymbol === asset.symbol ? 'bg-gray-800' : ''
                }`}
              >
                <td className="px-4 py-3 font-semibold">{asset.symbol}</td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{asset.name}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCurrency(asset.price)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}