import React, { useState, useEffect } from 'react';
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Wallet,
} from 'lucide-react';
import Button from '../../components/common/Button';

const API_BASE = '/api';

const MOCK_TXNS = [
  {
    _id: 'tx-1',
    txId: 'TXN-98421034',
    type: 'ORDER_PAYMENT',
    amount: 850,
    balanceAfter: 1600,
    reference: 'Order #ORD-2026-9182 payment',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'SUCCESS',
  },
  {
    _id: 'tx-2',
    txId: 'TXN-76123490',
    type: 'WALLET_RECHARGE',
    amount: 2000,
    balanceAfter: 2450,
    reference: 'Razorpay recharge (pay_98a7sd)',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'SUCCESS',
  },
  {
    _id: 'tx-3',
    txId: 'TXN-34981205',
    type: 'REFUND',
    amount: 120,
    balanceAfter: 450,
    reference: 'Refund for missing carrot bundle',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    status: 'SUCCESS',
  },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(MOCK_TXNS);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('farmconnect_token');
      const url = filterType === 'ALL'
        ? `${API_BASE}/wallet/transactions`
        : `${API_BASE}/wallet/transactions?type=${filterType}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.transactions?.length) {
          setTransactions(data.transactions);
        }
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const filteredTxns = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.txId?.toLowerCase().includes(q) ||
      tx.reference?.toLowerCase().includes(q)
    );
  });

  const getBadge = (type) => {
    const isCredit = type === 'WALLET_RECHARGE' || type === 'CREDIT' || type === 'REFUND';
    if (isCredit) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowDownLeft className="w-3 h-3" />
          {type.replace('_', ' ')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        <ArrowUpRight className="w-3 h-3" />
        {type.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-farm-600" />
            <span>Transaction Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete cryptographic audit trail of all purse top-ups, orders, and farmer payouts.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Recharges', value: 'WALLET_RECHARGE' },
            { label: 'Order Debits', value: 'ORDER_PAYMENT' },
            { label: 'Refunds', value: 'REFUND' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterType(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                filterType === tab.value
                  ? 'bg-farm-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TXN ID or notes..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-farm-600"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-2">
                <th className="py-2.5">Transaction ID</th>
                <th className="py-2.5">Type</th>
                <th className="py-2.5">Description</th>
                <th className="py-2.5">Date & Time</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTxns.map((tx) => {
                const isCredit =
                  tx.type === 'WALLET_RECHARGE' ||
                  tx.type === 'CREDIT' ||
                  tx.type === 'REFUND';
                return (
                  <tr key={tx._id || tx.txId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-mono text-slate-900 font-bold">
                      {tx.txId}
                    </td>
                    <td className="py-3">{getBadge(tx.type)}</td>
                    <td className="py-3 text-slate-700">{tx.reference}</td>
                    <td className="py-3 text-slate-400">
                      {new Date(tx.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-farm-700 bg-farm-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-farm-600" />
                        {tx.status}
                      </span>
                    </td>
                    <td
                      className={`py-3 text-right font-bold text-sm ${
                        isCredit ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500">
                      ₹{tx.balanceAfter?.toLocaleString() || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTxns.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No transactions found</p>
            <p className="text-[11px] text-slate-400">Transactions will appear here as orders and recharges occur.</p>
          </div>
        )}
      </div>
    </div>
  );
}
