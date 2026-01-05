import { SalesRecord } from '../data/mockSalesData';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartsProps {
  data: SalesRecord[];
}

export function SalesChart({ data }: ChartsProps) {
  const dailyData = data.reduce((acc, record) => {
    const date = new Date(record.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);

    if (existing) {
      existing.cash += record.paymentType === 'CASH' ? record.amount : 0;
      existing.ar += record.paymentType === 'ACCOUNTS_RECEIVABLE' ? record.amount : 0;
      existing.total += record.amount;
    } else {
      acc.push({
        date,
        cash: record.paymentType === 'CASH' ? record.amount : 0,
        ar: record.paymentType === 'ACCOUNTS_RECEIVABLE' ? record.amount : 0,
        total: record.amount,
      });
    }
    return acc;
  }, [] as Array<{ date: string; cash: number; ar: number; total: number }>);

  const sortedData = dailyData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
        Sales Trend Analysis
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={sortedData}>
          <defs>
            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
            }}
            formatter={(value: number) => `₱${value.toLocaleString()}`}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Area type="monotone" dataKey="cash" name="Cash Sales" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCash)" />
          <Area type="monotone" dataKey="ar" name="A/R Sales" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAR)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AggregateDistribution({ data }: ChartsProps) {
  const aggregateData = data.reduce((acc, record) => {
    if (record.aggregateType) {
      const existing = acc.find(item => item.name === record.aggregateType);
      if (existing) {
        existing.value += record.aggregateQuantity || 0;
      } else {
        acc.push({
          name: record.aggregateType,
          value: record.aggregateQuantity || 0,
        });
      }
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-violet-400 to-purple-500 rounded-full"></div>
        Aggregate Distribution
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={aggregateData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const { name, percent } = (props || {}) as { name?: string; percent?: number };
              const pct = typeof percent === 'number' ? (percent * 100).toFixed(0) : '0';
              return `${name ?? ''} ${pct}%`;
            }}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {aggregateData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
            }}
            formatter={(value: number) => `${value.toFixed(2)}m³`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueComparison({ data }: ChartsProps) {
  const companyData = data.reduce((acc, record) => {
    const existing = acc.find(item => item.name === record.companyName);
    if (existing) {
      existing.revenue += record.amount;
    } else {
      acc.push({
        name: record.companyName,
        revenue: record.amount,
      });
    }
    return acc;
  }, [] as Array<{ name: string; revenue: number }>);

  const topCompanies = companyData
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full"></div>
        Top Customers by Revenue
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={topCompanies} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" style={{ fontSize: '11px' }} width={150} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
            }}
            formatter={(value: number) => `₱${value.toLocaleString()}`}
          />
          <Bar dataKey="revenue" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VolumeChart({ data }: ChartsProps) {
  const dailyVolume = data.reduce((acc, record) => {
    const date = new Date(record.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);

    if (existing) {
      existing.volume += record.aggregateQuantity || 0;
    } else {
      acc.push({
        date,
        volume: record.aggregateQuantity || 0,
      });
    }
    return acc;
  }, [] as Array<{ date: string; volume: number }>);

  const sortedData = dailyVolume.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
        Volume Trend
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
            }}
            formatter={(value: number) => `${value.toFixed(2)}m³`}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
