import { Portfolio } from '@/types';

interface Props {
  portfolio: Portfolio | undefined;
  isLoading: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatPnl = (value: number) => {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};

export default function StatsCards({ portfolio, isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-gray-400 text-sm mb-1">Cash Balance</p>
        <p className="text-2xl font-bold">
          {isLoading ? '...' : formatCurrency(portfolio?.balance ?? 0)}
        </p>
      </div>
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-gray-400 text-sm mb-1">Total Equity</p>
        <p className="text-2xl font-bold">
          {isLoading ? '...' : formatCurrency(portfolio?.totalEquity ?? 0)}
        </p>
      </div>
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-gray-400 text-sm mb-1">Unrealized P&L</p>
        <p className={`text-2xl font-bold ${
          (portfolio?.totalUnrealizedPnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {isLoading ? '...' : formatPnl(portfolio?.totalUnrealizedPnl ?? 0)}
        </p>
      </div>
    </div>
  );
}