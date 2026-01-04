import { SalesRecord } from '../data/mockSalesData';
import { useMemo, useState } from 'react';

interface SalesTableProps {
  data: SalesRecord[];
  period: string;
}

export function SalesTable({ data, period }: SalesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime());
  }, [data]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalAmount = data.reduce((sum, record) => sum + record.amount, 0);

  const types: Array<'S-1' | 'G-1' | '3/4' | '3/8' | 'WASTE'> = ['S-1', 'G-1', '3/4', '3/8', 'WASTE'];
  const qtyTotals = useMemo(() => {
    return types.reduce<Record<string, number>>((acc, t) => {
      acc[t] = data
        .filter(r => (r.aggregateType || '').toUpperCase() === t)
        .reduce((s, r) => s + (Number(r.aggregateQuantity) || 0), 0);
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  const getQtyForType = (record: SalesRecord, type: string) => {
    return (record.aggregateType || '').toUpperCase() === type ? Number(record.aggregateQuantity) || 0 : 0;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
            Sales Tally Sheet - {period}
          </h3>
          <div className="text-right">
            <p className="text-sm text-cyan-400/80 uppercase tracking-wider">Total Records</p>
            <p className="text-2xl font-bold text-white">{data.length}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-cyan-500/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">Company Name</th>
              {types.map(t => (
                <th key={t} className="px-4 py-3 text-right text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  {t}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">Plate No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">DR/IS/INV #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider">Payment Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-400 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {currentData.map((record) => (
              <tr key={record.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">{formatDate(record.saleDate)}</td>
                <td className="px-4 py-3 text-sm font-medium text-white">{record.companyName}</td>
                {types.map(t => (
                  <td key={t} className="px-4 py-3 text-sm text-right text-slate-300">
                    {getQtyForType(record, t) ? `${getQtyForType(record, t)}m³` : '-'}
                  </td>
                ))}
                <td className="px-4 py-3 text-sm text-slate-300">{record.driverName}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{record.plateNumber}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{record.drIsInvNumber}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.paymentType === 'CASH'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                    }`}
                  >
                    {record.paymentType === 'CASH' ? 'Cash' : 'A/R'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-white text-right whitespace-nowrap">{formatCurrency(record.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-800/80 border-t-2 border-cyan-500/50">
            <tr>
              <td className="px-4 py-4 text-right text-sm font-bold text-cyan-400 uppercase tracking-wider" colSpan={2}>Totals:</td>
              {types.map(t => (
                <td key={t} className="px-4 py-4 text-right text-sm font-bold text-cyan-300">
                  {qtyTotals[t] ? `${qtyTotals[t]}m³` : '0m³'}
                </td>
              ))}
              <td className="px-4 py-4" colSpan={4}></td>
              <td className="px-4 py-4 text-right text-lg font-bold text-emerald-400">{formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-cyan-500/20 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700/50 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'border border-slate-700/50 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700/50 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
