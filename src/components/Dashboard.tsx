import { useState, useMemo, useEffect } from 'react';
import { SalesRecord } from '../data/mockSalesData';
import { SalesMetrics } from './SalesMetrics';
import { SalesTable } from './SalesTable';
import { SalesChart, AggregateDistribution, RevenueComparison, VolumeChart } from './Charts';
import { LayoutGrid, TrendingUp, FileText } from 'lucide-react';
import supabase from '../lib/supabaseClient';

type TimePeriod = 'today' | 'daily' | 'monthly' | 'quarterly' | 'yearly';
type TabType = 'overview' | 'analytics' | 'reports' | 'admin';

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [addedRecords, setAddedRecords] = useState<SalesRecord[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  // inline editing handled inside SalesTable; no modal state here
  const [newRecord, setNewRecord] = useState<{
    saleDate: string;
    companyName: string;
    aggregateType: string;
    aggregateQuantity: number;
    amount: number;
    paymentType: 'CASH' | 'ACCOUNTS_RECEIVABLE';
    driverName: string;
    plateNumber: string;
    hauler: string;
    cashPoNumber: string;
    drIsInvNumber: string;
    loadedBy: string;
    s1Qty: number;
    g1Qty: number;
    threeFourthQty: number; // 3/4
    threeEightQty: number;  // 3/8
    mixThreeFourthThreeEightQty: number; // MIX 3/4 & 3/8
    wasteQty: number; // WASTE
  }>({
    saleDate: new Date().toISOString().split('T')[0],
    companyName: '',
    aggregateType: '',
    aggregateQuantity: 0,
    amount: 0,
    paymentType: 'CASH',
    driverName: '',
    plateNumber: '',
    hauler: '',
    cashPoNumber: '',
    drIsInvNumber: '',
    loadedBy: '',
    s1Qty: 0,
    g1Qty: 0,
    threeFourthQty: 0,
    threeEightQty: 0,
    mixThreeFourthThreeEightQty: 0,
    wasteQty: 0,
  });

  type PaymentType = 'CASH' | 'ACCOUNTS_RECEIVABLE';
  const handlePaymentTypeChange = (val: PaymentType) =>
    setNewRecord({ ...newRecord, paymentType: val });


  // Use only Supabase data; no mock data
  const allSalesData: SalesRecord[] = useMemo(() => [], []);

  const filteredData = useMemo(() => {
    const selected = new Date(selectedDate);

    const all = [...addedRecords];

    return all.filter(record => {
      const recordDate = new Date(record.saleDate);

      switch (timePeriod) {
        case 'today':
          const today = new Date();
          return recordDate.toDateString() === today.toDateString();

        case 'daily':
          return recordDate.toDateString() === selected.toDateString();

        case 'monthly':
          return recordDate.getMonth() === selected.getMonth() &&
                 recordDate.getFullYear() === selected.getFullYear();

        case 'quarterly':
          const quarter = Math.floor(selected.getMonth() / 3);
          const recordQuarter = Math.floor(recordDate.getMonth() / 3);
          return recordQuarter === quarter &&
                 recordDate.getFullYear() === selected.getFullYear();

        case 'yearly':
          return recordDate.getFullYear() === selected.getFullYear();

        default:
          return true;
      }
    });
  }, [allSalesData, addedRecords, timePeriod, selectedDate]);

  const anyQtySelected = () =>
    newRecord.s1Qty > 0 ||
    newRecord.g1Qty > 0 ||
    newRecord.threeFourthQty > 0 ||
    newRecord.threeEightQty > 0 ||
    newRecord.wasteQty > 0;

  const aggregatesTotal = useMemo(
    () =>
      newRecord.s1Qty +
      newRecord.g1Qty +
      newRecord.threeFourthQty +
      newRecord.threeEightQty +
      newRecord.wasteQty,
    [
      newRecord.s1Qty,
      newRecord.g1Qty,
      newRecord.threeFourthQty,
      newRecord.threeEightQty,
      newRecord.wasteQty,
    ]
  );

  const fetchSupabase = useMemo(() => async () => {
    const { data, error } = await supabase
      .from('sales_records')
      .select('*');
    if (error) {
      console.error('Supabase fetch error', error);
      return;
    }
    if (data && Array.isArray(data)) {
      const mapped: SalesRecord[] = data.map((r: any) => ({
        id: r.id?.toString?.() ?? `${r.id}`,
        saleDate: r.saleDate ? new Date(r.saleDate) : new Date(r.sale_date ?? Date.now()),
        companyName: r.companyName ?? r.company_name ?? '',
        aggregateType: r.aggregateType ?? r.aggregate_type ?? '',
        aggregateQuantity: Number(r.aggregateQuantity ?? r.aggregate_quantity ?? 0),
        driverName: r.driverName ?? r.driver_name ?? '',
        plateNumber: r.plateNumber ?? r.plate_number ?? '',
        hauler: r.hauler ?? '',
        cashPoNumber: r.cashPoNumber ?? r.cash_po_number ?? '',
        drIsInvNumber: r.drIsInvNumber ?? r.dr_is_inv_number ?? '',
        loadedBy: r.loadedBy ?? r.loaded_by ?? '',
        amount: Number(r.amount ?? 0),
        paymentType: (r.paymentType ?? r.payment_type ?? 'CASH') as 'CASH' | 'ACCOUNTS_RECEIVABLE',
      }));
      setAddedRecords(mapped);
    }
  }, []);

  useEffect(() => {
    // restore admin login from localStorage
    try {
      const stored = localStorage.getItem('isAdmin');
      if (stored === 'true') setIsAdmin(true);
    } catch {}
    fetchSupabase();
  }, [fetchSupabase]);

  const handleDeleteRecord = async (record: SalesRecord) => {
    try {
      const { error } = await supabase.from('sales_records').delete().eq('id', record.id);
      if (error) {
        console.error('Supabase delete error', error);
        return;
      }
      setAddedRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (e) {
      console.error('Delete exception', e);
    }
  };

  const handleSaveEditInline = async (id: string, draft: {
    aggregateType: string; aggregateQuantity: number; amount: number; paymentType: 'CASH'|'ACCOUNTS_RECEIVABLE'; driverName: string; plateNumber: string; drIsInvNumber: string; hauler: string; loadedBy: string; companyName: string;
  }) => {
    try {
      const payload = {
        aggregate_type: draft.aggregateType,
        aggregate_quantity: draft.aggregateQuantity,
        amount: draft.amount,
        payment_type: draft.paymentType,
        driver_name: draft.driverName,
        plate_number: draft.plateNumber,
        dr_is_inv_number: draft.drIsInvNumber,
        hauler: draft.hauler,
        loaded_by: draft.loadedBy,
        company_name: draft.companyName,
      };
      const isNumericId = /^\d+$/.test(String(id));
      const idValue: any = isNumericId ? Number(id) : id;
      const { error } = await supabase.from('sales_records').update(payload).eq('id', idValue);
      if (error) {
        console.error('Supabase update error', error);
        return;
      }
      // optimistic local update so UI reflects immediately
      setAddedRecords(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            aggregateType: draft.aggregateType,
            aggregateQuantity: draft.aggregateQuantity,
            amount: draft.amount,
            paymentType: draft.paymentType,
            driverName: draft.driverName,
            plateNumber: draft.plateNumber,
            drIsInvNumber: draft.drIsInvNumber,
            hauler: draft.hauler,
            loadedBy: draft.loadedBy,
            companyName: draft.companyName,
          };
        }
        return r;
      }));
      await fetchSupabase();
    } catch (e) {
      console.error('Update exception', e);
    }
  };

  const getPeriodLabel = () => {
    const date = timePeriod === 'today' ? new Date() : new Date(selectedDate);

    switch (timePeriod) {
      case 'today':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      case 'daily':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      case 'monthly':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return '';
    }
  };

  const tabs = useMemo(() => {
    const base = [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      { id: 'reports', label: 'Reports', icon: FileText },
    ];
    if (isAdmin) {
      base.push({ id: 'admin', label: 'Admin', icon: FileText });
    }
    return base;
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMWUxZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6TTI0IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6TTEyIDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

      <div className="relative max-w-[1600px] mx-auto px-6 py-8">
        <div className="backdrop-blur-xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-3xl border border-cyan-500/30 p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50"></div>
                
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  ROCKSTAR INDUSTRIES CORP
                </h1>
                <p className="text-cyan-400/70 text-sm font-medium tracking-wider uppercase">
                  Advanced Sales Analytics Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isAdmin ? (
                <button
                  onClick={() => { setActiveTab('admin'); setLoginError(''); }}
                  className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:opacity-95 transition"
                >
                  Log In as Admin
                </button>
              ) : (
                <button
                  onClick={() => { setIsAdmin(false); try { localStorage.removeItem('isAdmin'); } catch {} }}
                  className="px-4 py-2 rounded-lg font-semibold bg-slate-800/70 text-slate-200 border border-slate-700 hover:bg-slate-700/70 transition"
                >
                  Log Out
                </button>
              )}

    {/* Inline editing only; modal removed as requested */}
            </div>
          </div>

          {activeTab === 'admin' && !isAdmin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70">
              <div className="w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Admin Login</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  {loginError && (
                    <div className="text-pink-400 text-sm font-medium">{loginError}</div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('overview');
                        setLoginError('');
                        setLoginUsername('');
                        setLoginPassword('');
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-700/80 text-slate-200 border border-slate-600 hover:bg-slate-700"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (loginUsername === 'Jasper' && loginPassword === 'Admin123') {
                          setIsAdmin(true);
                          try { localStorage.setItem('isAdmin', 'true'); } catch {}
                          setLoginError('');
                          setLoginUsername('');
                          setLoginPassword('');
                        } else {
                          setLoginError('Invalid credentials');
                        }
                      }}
                      className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow hover:opacity-95"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          

          <div className="flex flex-wrap gap-3 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab !== 'admin' && (
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">
                Time Period
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'today', label: 'Today' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'yearly', label: 'Yearly' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTimePeriod(option.value as TimePeriod)}
                    className={`relative px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                      timePeriod === option.value
                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/50'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {timePeriod !== 'today' && (
              <div>
                <label className="block text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  aria-label="Select date"
                  title="Select date"
                  className="px-5 py-2.5 bg-slate-800/80 border border-slate-700/50 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>
          )}

          {activeTab !== 'admin' && (
            <div className="mt-6 pt-6 border-t border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-white">
                  Active Period: <span className="text-cyan-400">{getPeriodLabel()}</span>
                </h2>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <SalesMetrics data={filteredData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesChart data={filteredData} />
              <AggregateDistribution data={filteredData} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <SalesMetrics data={filteredData} />
            <div className="grid grid-cols-1 gap-6">
              <SalesChart data={filteredData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VolumeChart data={filteredData} />
                <AggregateDistribution data={filteredData} />
              </div>
              <RevenueComparison data={filteredData} />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            <SalesMetrics data={filteredData} />
            <SalesTable
              data={filteredData}
              period={getPeriodLabel()}
              isAdmin={isAdmin}
              onDelete={handleDeleteRecord}
              onSaveEdit={handleSaveEditInline}
            />
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-800/40 p-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Add Record for Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="admin-date" className="block text-sm font-semibold text-cyan-300 mb-2">Date</label>
                  <input
                    id="admin-date"
                    type="date"
                    value={newRecord.saleDate}
                    onChange={(e) => setNewRecord({ ...newRecord, saleDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-company" className="block text-sm font-semibold text-cyan-300 mb-2">Company Name</label>
                  <input
                    id="admin-company"
                    type="text"
                    value={newRecord.companyName}
                    onChange={(e) => setNewRecord({ ...newRecord, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-driver" className="block text-sm font-semibold text-cyan-300 mb-2">Driver's Name</label>
                  <input
                    id="admin-driver"
                    type="text"
                    value={newRecord.driverName}
                    onChange={(e) => setNewRecord({ ...newRecord, driverName: e.target.value })}
                    placeholder="Driver's Name"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-plate" className="block text-sm font-semibold text-cyan-300 mb-2">Plate No.</label>
                  <input
                    id="admin-plate"
                    type="text"
                    value={newRecord.plateNumber}
                    onChange={(e) => setNewRecord({ ...newRecord, plateNumber: e.target.value })}
                    placeholder="Plate Number"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-hauler" className="block text-sm font-semibold text-cyan-300 mb-2">Hauler</label>
                  <input
                    id="admin-hauler"
                    type="text"
                    value={newRecord.hauler}
                    onChange={(e) => setNewRecord({ ...newRecord, hauler: e.target.value })}
                    placeholder="Hauler"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-cashpo" className="block text-sm font-semibold text-cyan-300 mb-2">CASH / P.O #</label>
                  <input
                    id="admin-cashpo"
                    type="text"
                    value={newRecord.cashPoNumber}
                    onChange={(e) => setNewRecord({ ...newRecord, cashPoNumber: e.target.value })}
                    placeholder="Cash / PO Number"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-drinv" className="block text-sm font-semibold text-cyan-300 mb-2">DR/IS/INV #</label>
                  <input
                    id="admin-drinv"
                    type="text"
                    value={newRecord.drIsInvNumber}
                    onChange={(e) => setNewRecord({ ...newRecord, drIsInvNumber: e.target.value })}
                    placeholder="DR / IS / INV Number"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-loadedby" className="block text-sm font-semibold text-cyan-300 mb-2">Loaded By</label>
                  <input
                    id="admin-loadedby"
                    type="text"
                    value={newRecord.loadedBy}
                    onChange={(e) => setNewRecord({ ...newRecord, loadedBy: e.target.value })}
                    placeholder="Loaded By"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">Aggregates (m³)</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label htmlFor="s1-qty" className="block text-xs text-cyan-300 mb-1">S-1</label>
                      <input id="s1-qty" type="number" value={newRecord.s1Qty} onChange={(e)=>setNewRecord({ ...newRecord, s1Qty: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label htmlFor="g1-qty" className="block text-xs text-cyan-300 mb-1">G-1</label>
                      <input id="g1-qty" type="number" value={newRecord.g1Qty} onChange={(e)=>setNewRecord({ ...newRecord, g1Qty: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label htmlFor="tq-qty" className="block text-xs text-cyan-300 mb-1">3/4</label>
                      <input id="tq-qty" type="number" value={newRecord.threeFourthQty} onChange={(e)=>setNewRecord({ ...newRecord, threeFourthQty: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label htmlFor="te-qty" className="block text-xs text-cyan-300 mb-1">3/8</label>
                      <input id="te-qty" type="number" value={newRecord.threeEightQty} onChange={(e)=>setNewRecord({ ...newRecord, threeEightQty: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label htmlFor="waste-qty" className="block text-xs text-cyan-300 mb-1">Mix</label>
                      <input id="waste-qty" type="number" value={newRecord.wasteQty} onChange={(e)=>setNewRecord({ ...newRecord, wasteQty: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <div className="text-cyan-300 text-sm font-semibold">TOTAL: <span className="text-white">{aggregatesTotal} m³</span></div>
                  </div>
                </div>
                <div>
                  <label htmlFor="admin-amount" className="block text-sm font-semibold text-cyan-300 mb-2">Amount</label>
                  <input
                    id="admin-amount"
                    type="number"
                    step="0.01"
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord({ ...newRecord, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="admin-payment" className="block text-sm font-semibold text-cyan-300 mb-2">Payment Type</label>
                  <select
                    id="admin-payment"
                    value={newRecord.paymentType}
                    onChange={(e) => handlePaymentTypeChange(e.target.value as PaymentType)}
                    title="Payment Type"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="CASH">CASH</option>
                    <option value="ACCOUNTS_RECEIVABLE">ACCOUNTS RECEIVABLE</option>
                  </select>
                </div>
              </div>
              {formError && (
                <div className="mt-4 text-pink-400 text-sm font-medium" role="alert" aria-live="polite">
                  {formError}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={async () => {
                    setFormError('');
                    if (!newRecord.companyName) {
                      setFormError('Company Name is required.');
                      return;
                    }
                    if (!anyQtySelected()) {
                      setFormError('Enter quantity for at least one aggregate type.');
                      return;
                    }
                    setFormSubmitting(true);
                    const base = {
                      saleDate: new Date(newRecord.saleDate),
                      companyName: newRecord.companyName,
                      driverName: newRecord.driverName,
                      plateNumber: newRecord.plateNumber,
                      hauler: newRecord.hauler,
                      cashPoNumber: newRecord.cashPoNumber,
                      drIsInvNumber: newRecord.drIsInvNumber,
                      loadedBy: newRecord.loadedBy,
                      amount: Number(newRecord.amount),
                      paymentType: newRecord.paymentType,
                    } as const;

                    const toAdd: SalesRecord[] = [];
                    const pushIf = (type: string, qty: number) => {
                      if (qty && qty > 0) {
                        toAdd.push({
                          id: `${Date.now()}-${type}-${Math.random().toString(36).slice(2)}`,
                          aggregateType: type,
                          aggregateQuantity: Number(qty),
                          ...base,
                        });
                      }
                    };

                    pushIf('S-1', newRecord.s1Qty);
                    pushIf('G-1', newRecord.g1Qty);
                    pushIf('3/4', newRecord.threeFourthQty);
                    pushIf('3/8', newRecord.threeEightQty);
                    pushIf('Mix', newRecord.wasteQty);

                    if (toAdd.length === 0) return;
                    setAddedRecords(prev => [...prev, ...toAdd]);

                    // Persist to Supabase
                    try {
                      const rows = toAdd.map(r => ({
                        sale_date: r.saleDate.toISOString(),
                        company_name: r.companyName,
                        aggregate_type: r.aggregateType,
                        aggregate_quantity: r.aggregateQuantity,
                        driver_name: r.driverName,
                        plate_number: r.plateNumber,
                        hauler: r.hauler,
                        cash_po_number: r.cashPoNumber,
                        dr_is_inv_number: r.drIsInvNumber,
                        loaded_by: r.loadedBy,
                        amount: r.amount,
                        payment_type: r.paymentType,
                      }));
                      const { error } = await supabase.from('sales_records').insert(rows);
                      if (error) {
                        console.error('Supabase insert error', error);
                        setFormError('Failed to save to the database. Please try again.');
                        setFormSubmitting(false);
                        return;
                      }
                    } catch (e) {
                      console.error('Supabase insert exception', e);
                      setFormError('Unexpected error while saving.');
                      setFormSubmitting(false);
                      return;
                    }

                    setNewRecord({
                      saleDate: new Date().toISOString().split('T')[0],
                      companyName: '',
                      aggregateType: '',
                      aggregateQuantity: 0,
                      amount: 0,
                      paymentType: 'CASH',
                      driverName: '',
                      plateNumber: '',
                      hauler: '',
                      cashPoNumber: '',
                      drIsInvNumber: '',
                      loadedBy: '',
                      s1Qty: 0,
                      g1Qty: 0,
                      threeFourthQty: 0,
                      threeEightQty: 0,
                      mixThreeFourthThreeEightQty: 0,
                      wasteQty: 0,
                    });
                    setFormSubmitting(false);
                  }}
                  disabled={formSubmitting}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-white shadow hover:opacity-95 ${formSubmitting ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                >
                  {formSubmitting ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
