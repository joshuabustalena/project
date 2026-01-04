import { SalesRecord } from '../data/mockSalesData';
import { DollarSign, TrendingUp, Package, CreditCard } from 'lucide-react';

interface SalesMetricsProps {
  data: SalesRecord[];
}

export function SalesMetrics({ data }: SalesMetricsProps) {
  const totalSales = data.reduce((sum, record) => sum + record.amount, 0);
  const cashSales = data.filter(r => r.paymentType === 'CASH').reduce((sum, r) => sum + r.amount, 0);
  const arSales = data.filter(r => r.paymentType === 'ACCOUNTS_RECEIVABLE').reduce((sum, r) => sum + r.amount, 0);
  const totalVolume = data.reduce((sum, record) => sum + (record.aggregateQuantity || 0), 0);

  const aggregateBreakdown = data.reduce((acc, record) => {
    if (record.aggregateType) {
      acc[record.aggregateType] = (acc[record.aggregateType] || 0) + (record.aggregateQuantity || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const metrics = [
    {
      label: 'Total Sales',
      value: formatCurrency(totalSales),
      icon: DollarSign,
      gradient: 'from-emerald-400 to-teal-500',
      glow: 'shadow-emerald-500/50',
    },
    {
      label: 'Cash Sales',
      value: formatCurrency(cashSales),
      icon: CreditCard,
      gradient: 'from-cyan-400 to-blue-500',
      glow: 'shadow-cyan-500/50',
    },
    {
      label: 'Accounts Receivable',
      value: formatCurrency(arSales),
      icon: TrendingUp,
      gradient: 'from-violet-400 to-purple-500',
      glow: 'shadow-violet-500/50',
    },
    {
      label: 'Total Volume',
      value: `${totalVolume.toFixed(2)}m³`,
      icon: Package,
      gradient: 'from-amber-400 to-orange-500',
      glow: 'shadow-amber-500/50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-gradient-to-br ${metric.gradient} p-3 rounded-xl shadow-lg ${metric.glow}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-cyan-400/80 mb-1 uppercase tracking-wider">{metric.label}</p>
                <p className="text-3xl font-black text-white">{metric.value}</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-2xl" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
          Aggregate Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(aggregateBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([type, quantity]) => (
              <div key={type} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
                <p className="text-sm font-medium text-cyan-400/80 mb-1 uppercase tracking-wider">{type}</p>
                <p className="text-2xl font-bold text-white">{quantity.toFixed(1)}m³</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
