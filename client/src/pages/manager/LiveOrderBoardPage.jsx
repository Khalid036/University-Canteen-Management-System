import React, { useEffect, useState } from 'react';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  CheckCheck,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatPrice, formatDate, cn } from '../../lib/utils';

export const LiveOrderBoardPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', {
        params: {
          status: statusFilter,
          priorityOnly: priorityOnly ? 'true' : 'false'
        }
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // 8s polling for manager board
    return () => clearInterval(interval);
  }, [statusFilter, priorityOnly]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Group orders for summary count
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Header & Board Controls */}
      <div className="bg-white border-4 border-black p-5 shadow-neo flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <NeoBadge variant="yellow" size="sm">REAL-TIME KITCHEN QUEUE</NeoBadge>
          <h1 className="text-3xl font-black uppercase text-black mt-1">Live Order Board</h1>
          <p className="text-xs font-bold text-neutral-600">
            Click quick-advance buttons to move orders through kitchen preparation stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter toggle */}
          <button
            onClick={() => setPriorityOnly(!priorityOnly)}
            className={cn(
              'neo-btn px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 border-2',
              priorityOnly ? 'bg-neo-purple text-black' : 'bg-white text-black'
            )}
          >
            <Sparkles size={14} />
            <span>Faculty VIP Only</span>
          </button>

          <NeoButton variant="secondary" size="md" onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </NeoButton>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={cn(
            'neo-btn p-2 text-xs font-black uppercase text-center border-2',
            statusFilter === 'ALL' ? 'bg-black text-white' : 'bg-white text-black'
          )}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={cn(
            'neo-btn p-2 text-xs font-black uppercase text-center border-2',
            statusFilter === 'PENDING' ? 'bg-neo-yellow text-black' : 'bg-white text-black'
          )}
        >
          ⏳ Pending ({pendingOrders.length})
        </button>
        <button
          onClick={() => setStatusFilter('PREPARING')}
          className={cn(
            'neo-btn p-2 text-xs font-black uppercase text-center border-2',
            statusFilter === 'PREPARING' ? 'bg-neo-blue text-black' : 'bg-white text-black'
          )}
        >
          🍳 Preparing ({preparingOrders.length})
        </button>
        <button
          onClick={() => setStatusFilter('READY')}
          className={cn(
            'neo-btn p-2 text-xs font-black uppercase text-center border-2',
            statusFilter === 'READY' ? 'bg-neo-green text-black' : 'bg-white text-black'
          )}
        >
          🔥 Ready ({readyOrders.length})
        </button>
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={cn(
            'neo-btn p-2 text-xs font-black uppercase text-center border-2',
            statusFilter === 'COMPLETED' ? 'bg-neo-muted text-black' : 'bg-white text-black'
          )}
        >
          ✅ Completed ({completedOrders.length})
        </button>
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin text-5xl mb-3">🍳</div>
          <p className="font-black uppercase text-lg">Loading Kitchen Orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-neo">
          <div className="text-6xl mb-3">✨</div>
          <h3 className="text-xl font-black uppercase">No active orders matching filter!</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1">
            Kitchen queue is all caught up or no orders match current filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className={cn(
                  'neo-card p-4 border-4 shadow-neo bg-white flex flex-col justify-between gap-4',
                  order.isPriority && 'border-purple-600 shadow-[6px_6px_0px_0px_#9333ea]'
                )}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-black uppercase">
                        #{order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>

                    {order.isPriority && (
                      <NeoBadge variant="purple" size="sm" className="gap-1 animate-pulse">
                        <Sparkles size={12} /> VIP FACULTY
                      </NeoBadge>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="text-xs font-bold text-neutral-700 bg-neutral-100 p-2 border-2 border-black">
                    <div className="flex justify-between">
                      <span className="font-black text-black">{order.user?.name}</span>
                      <span className="uppercase text-neutral-500 font-extrabold">{order.user?.role}</span>
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-0.5">
                      {order.user?.department || 'General'} • {order.user?.phone || 'No phone'}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1 py-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                      Food Items:
                    </span>
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-xs font-bold py-1 border-b border-dashed border-neutral-300"
                      >
                        <span className="text-black">
                          <strong className="text-neo-pink mr-1 font-black">{item.quantity}x</strong>{' '}
                          {item.menuItem?.name}
                        </span>
                        <span className="text-neutral-600">
                          {formatPrice(item.priceAtOrder * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Notes & Pickup */}
                  <div className="text-xs font-bold space-y-1 pt-1">
                    <p className="text-neutral-800">
                      <span className="font-black">Pickup:</span> {order.pickupTime}
                    </p>
                    {order.notes && (
                      <p className="text-amber-800 bg-yellow-50 p-1.5 border border-black text-[11px]">
                        📝 <strong>Note:</strong> {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total & Action Status Transitions */}
                <div className="pt-3 border-t-2 border-black space-y-3">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-neutral-500 uppercase">Total Paid</span>
                    <span className="text-base bg-neo-yellow px-2 py-0.5 border-2 border-black">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  {/* Action Transition Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <NeoButton
                          variant="blue"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          className="w-full text-xs"
                        >
                          <ChefHat size={14} /> Start Cooking
                        </NeoButton>
                        <NeoButton
                          variant="destructive"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          className="w-full text-xs"
                        >
                          Cancel
                        </NeoButton>
                      </>
                    )}

                    {order.status === 'PREPARING' && (
                      <>
                        <NeoButton
                          variant="green"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          className="col-span-2 text-xs justify-center"
                        >
                          <CheckCircle2 size={14} /> Mark Ready for Pickup
                        </NeoButton>
                      </>
                    )}

                    {order.status === 'READY' && (
                      <>
                        <NeoButton
                          variant="dark"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                          className="col-span-2 text-xs justify-center"
                        >
                          <CheckCheck size={14} /> Complete & Collected
                        </NeoButton>
                      </>
                    )}

                    {order.status === 'COMPLETED' && (
                      <div className="col-span-2 text-center text-xs font-black text-neutral-500 py-1">
                        Order Completed
                      </div>
                    )}

                    {order.status === 'CANCELLED' && (
                      <div className="col-span-2 text-center text-xs font-black text-red-600 py-1">
                        Order Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
