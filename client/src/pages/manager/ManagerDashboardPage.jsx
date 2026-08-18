import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  UtensilsCrossed,
  ArrowRight,
  TrendingUp,
  ChefHat
} from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { formatPrice } from '../../lib/utils';

export const ManagerDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/reports/summary');
        setSummary(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-neo-yellow border-4 border-black p-6 shadow-neo-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <NeoBadge variant="dark" size="sm">CANTEEN OPERATIONS</NeoBadge>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-1">
            Manager Control Hub 🍳
          </h1>
          <p className="text-xs font-bold text-neutral-800">
            Monitor incoming orders, inventory health, and today's kitchen performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/manager">
            <NeoButton variant="dark" size="lg" className="gap-2">
              <ShoppingBag size={18} /> Open Live Board
            </NeoButton>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today Revenue */}
        <NeoCard className="border-4 shadow-neo bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-neutral-600">Today's Revenue</span>
            <div className="w-10 h-10 bg-neo-green border-2 border-black flex items-center justify-center font-black">
              <DollarSign size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-black">
              {loading ? '...' : formatPrice(summary?.todayRevenue || 0)}
            </h3>
            <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Total Lifetime: {formatPrice(summary?.totalRevenue || 0)}
            </p>
          </div>
        </NeoCard>

        {/* Active Kitchen Orders */}
        <NeoCard className="border-4 shadow-neo bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-neutral-600">Active in Kitchen</span>
            <div className="w-10 h-10 bg-neo-blue border-2 border-black flex items-center justify-center font-black animate-pulse">
              <Clock size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-black">
              {loading ? '...' : summary?.activeOrders || 0}
            </h3>
            <p className="text-xs font-bold text-neutral-600 mt-1">
              Pending / Preparing / Ready
            </p>
          </div>
        </NeoCard>

        {/* Low Stock Alerts */}
        <NeoCard className="border-4 shadow-neo bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-neutral-600">Low Stock Alert</span>
            <div className="w-10 h-10 bg-neo-red text-white border-2 border-black flex items-center justify-center font-black">
              <AlertTriangle size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-black">
              {loading ? '...' : summary?.lowStockItems || 0}
            </h3>
            <p className="text-xs font-bold text-red-600 mt-1">
              Items with ≤ 5 units left
            </p>
          </div>
        </NeoCard>

        {/* Total Users */}
        <NeoCard className="border-4 shadow-neo bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-neutral-600">Registered Users</span>
            <div className="w-10 h-10 bg-neo-purple border-2 border-black flex items-center justify-center font-black">
              <Users size={20} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black text-black">
              {loading ? '...' : summary?.totalUsers || 0}
            </h3>
            <p className="text-xs font-bold text-neutral-600 mt-1">
              Students & Faculty members
            </p>
          </div>
        </NeoCard>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/manager" className="group">
          <NeoCard className="border-4 shadow-neo bg-white group-hover:bg-neo-yellow transition-colors h-full flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-3xl">📋</span>
              <h3 className="text-xl font-black uppercase">Live Order Kanban</h3>
              <p className="text-xs font-bold text-neutral-600">
                Transition incoming student/teacher orders across Pending, Cooking, and Ready statuses.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase">
              <span>Open Board</span>
              <ArrowRight size={16} />
            </div>
          </NeoCard>
        </Link>

        <Link to="/manager/menu" className="group">
          <NeoCard className="border-4 shadow-neo bg-white group-hover:bg-neo-pink transition-colors h-full flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-3xl">🍔</span>
              <h3 className="text-xl font-black uppercase">Menu & Pricing CRUD</h3>
              <p className="text-xs font-bold text-neutral-600">
                Add new daily specials, upload dish photography, adjust prices, and toggle veg/non-veg tags.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase">
              <span>Manage Menu</span>
              <ArrowRight size={16} />
            </div>
          </NeoCard>
        </Link>

        <Link to="/manager/reports" className="group">
          <NeoCard className="border-4 shadow-neo bg-white group-hover:bg-neo-green transition-colors h-full flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-3xl">📊</span>
              <h3 className="text-xl font-black uppercase">Sales & Reports</h3>
              <p className="text-xs font-bold text-neutral-600">
                View weekly revenue curves, best-selling dishes, and order status analytics with interactive charts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase">
              <span>View Analytics</span>
              <ArrowRight size={16} />
            </div>
          </NeoCard>
        </Link>
      </div>
    </div>
  );
};
