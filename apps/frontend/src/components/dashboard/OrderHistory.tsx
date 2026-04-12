import { Order } from '@/types';

interface Props {
  orders: Order[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function OrderHistory({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="text-center py-12 text-gray-400">No orders yet.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Symbol</th>
            <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Side</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Qty</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium hidden md:table-cell">Price</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Total</th>
            <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium hidden md:table-cell">Date</th>
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
              <td className="px-4 py-3 text-right font-mono hidden md:table-cell">
                {formatCurrency(order.price)}
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(order.total)}</td>
              <td className="px-4 py-3 text-right text-gray-400 text-sm hidden md:table-cell">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}