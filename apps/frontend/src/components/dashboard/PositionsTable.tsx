import { Position } from '@/types';

interface Props {
  positions: Position[] | undefined;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatPnl = (value: number) => {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};

export default function PositionsTable({ positions }: Props) {
  if (!positions || positions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="text-center py-12 text-gray-400">
          No open positions yet. Buy some stocks!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Symbol</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Qty</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium hidden md:table-cell">Avg Price</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Current</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">P&L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id} className="border-b border-gray-800">
              <td className="px-4 py-3 font-semibold">{pos.symbol}</td>
              <td className="px-4 py-3 text-right">{pos.quantity}</td>
              <td className="px-4 py-3 text-right font-mono hidden md:table-cell">
                {formatCurrency(pos.avgPrice)}
              </td>
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
    </div>
  );
}