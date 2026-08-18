import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Award, PieChart as PieIcon, RefreshCw } from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { formatPrice } from '../../lib/utils';

export const SalesReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales');
      setAnalytics(res.data.data);
    } catch (err) {
      console.error('Failed to load sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#FFE600', '#00D2FF', '#00E599', '#FF5E8E', '#B388FF', '#FF8800'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border-4 border-black p-5 shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <NeoBadge variant="green" size="sm">ANALYTICS & METRICS</NeoBadge>
          <h1 className="text-3xl font-black uppercase text-black mt-1">Sales & Kitchen Reports</h1>
          <p className="text-xs font-bold text-neutral-600">
            Daily revenue trends, top-selling dishes, and category breakdown.
          </p>
        </div>
        <NeoButton variant="secondary" size="md" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </NeoButton>
      </div>

      {/* Chart 1: Daily Revenue (Last 7 Days) */}
      <NeoCard className="border-4 shadow-neo bg-white">
        <NeoCardHeader className="bg-neo-yellow -mx-5 -mt-5 p-4 border-b-3 border-black">
          <NeoCardTitle className="text-lg flex items-center gap-2">
            <BarChart3 size={18} /> Daily Revenue Trends (Last 7 Days)
          </NeoCardTitle>
        </NeoCardHeader>

        <div className="h-80 w-full pt-4">
          {analytics?.last7Days ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.last7Days} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" tick={{ fontWeight: 'bold', fill: '#000' }} />
                <YAxis tick={{ fontWeight: 'bold', fill: '#000' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border-3 border-black shadow-neo-sm text-xs font-black">
                          <p className="uppercase text-neutral-600">{label}</p>
                          <p className="text-sm text-black">Revenue: {formatPrice(payload[0].value)}</p>
                          <p className="text-neutral-500">Orders: {payload[0].payload.orders}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#FFE600" stroke="#000" strokeWidth={3} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center font-bold">Loading chart...</div>
          )}
        </div>
      </NeoCard>

      {/* Charts Row: Top Selling Items & Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Selling Dishes */}
        <NeoCard className="border-4 shadow-neo bg-white">
          <NeoCardHeader className="bg-neo-pink -mx-5 -mt-5 p-4 border-b-3 border-black">
            <NeoCardTitle className="text-lg flex items-center gap-2">
              <Award size={18} /> Top 5 Best-Selling Dishes
            </NeoCardTitle>
          </NeoCardHeader>

          <div className="divide-y-2 divide-black mt-2">
            {analytics?.topSellingItems?.length > 0 ? (
              analytics.topSellingItems.map((item, idx) => (
                <div key={item.menuItemId || idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neo-yellow border-2 border-black flex items-center justify-center font-black text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-black">{item.name}</h4>
                      <span className="text-xs font-bold text-neutral-500">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-neo-green px-2 py-0.5 border-2 border-black text-xs font-black">
                      {item.totalSold} sold
                    </span>
                    <p className="text-xs font-black text-black mt-0.5">{formatPrice(item.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs font-bold text-neutral-500">
                No orders recorded yet to compute rankings.
              </div>
            )}
          </div>
        </NeoCard>

        {/* Category Breakdown */}
        <NeoCard className="border-4 shadow-neo bg-white">
          <NeoCardHeader className="bg-neo-blue -mx-5 -mt-5 p-4 border-b-3 border-black">
            <NeoCardTitle className="text-lg flex items-center gap-2">
              <PieIcon size={18} /> Category Revenue Distribution
            </NeoCardTitle>
          </NeoCardHeader>

          <div className="h-72 w-full pt-4">
            {analytics?.categoryData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    dataKey="totalRevenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    stroke="#000"
                    strokeWidth={2}
                    label={({ category }) => category}
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2.5 border-3 border-black shadow-neo-sm text-xs font-black">
                            <p>{payload[0].name}</p>
                            <p className="text-emerald-700">{formatPrice(payload[0].value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-bold">No category sales yet</div>
            )}
          </div>
        </NeoCard>
      </div>
    </div>
  );
};
