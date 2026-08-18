import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, RefreshCw, XCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatPrice, formatDate, cn, STATUS_CONFIG } from '../../lib/utils';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/me');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-poll orders every 10 seconds for real-time status update
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pending order?')) return;
    setCancellingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 border-4 border-black shadow-neo">
        <div>
          <NeoBadge variant="yellow" size="sm">LIVE TRACKING</NeoBadge>
          <h1 className="text-3xl font-black uppercase text-black mt-1">My Orders & Tray History</h1>
          <p className="text-xs font-bold text-neutral-600">
            Real-time status updates from the canteen kitchen. Auto-refreshes every 10s.
          </p>
        </div>
        <div className="flex gap-2">
          <NeoButton variant="secondary" size="md" onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </NeoButton>
          <Link to="/menu">
            <NeoButton variant="primary" size="md">
              Order Food
            </NeoButton>
          </Link>
        </div>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin text-5xl mb-3">⏳</div>
          <p className="font-black uppercase text-lg">Fetching your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-neo">
          <div className="text-6xl mb-3">🧾</div>
          <h3 className="text-2xl font-black uppercase">No Orders Yet!</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1 max-w-sm mx-auto">
            You haven't placed any canteen orders today. Check out the menu and order something fresh!
          </p>
          <Link to="/menu" className="mt-4 inline-block">
            <NeoButton variant="primary" size="lg">
              Explore Menu
            </NeoButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPending = order.status === 'PENDING';
            const isReady = order.status === 'READY';
            const isPreparing = order.status === 'PREPARING';

            return (
              <NeoCard
                key={order.id}
                className="border-4 shadow-neo bg-white hover:shadow-neo-lg transition-all"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-black">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xl text-black uppercase tracking-tight">
                      #{order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} size="lg" />
                    {order.isPriority && (
                      <NeoBadge variant="purple" size="sm" className="gap-1">
                        <Sparkles size={12} /> FACULTY PRIORITY
                      </NeoBadge>
                    )}
                  </div>

                  <span className="text-xs font-bold text-neutral-500">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Progress bar visual for active orders */}
                {(isPending || isPreparing || isReady) && (
                  <div className="my-4 p-3 bg-neo-bg border-2 border-black">
                    <div className="flex justify-between text-xs font-black uppercase mb-1">
                      <span className={isPending ? 'text-black font-black' : 'text-neutral-500'}>
                        1. Pending
                      </span>
                      <span className={isPreparing ? 'text-neo-blue font-black' : 'text-neutral-500'}>
                        2. Preparing 🍳
                      </span>
                      <span className={isReady ? 'text-emerald-700 font-black animate-pulse' : 'text-neutral-500'}>
                        3. Ready for Counter Pickup 🔥
                      </span>
                    </div>
                    <div className="w-full bg-white h-3 border-2 border-black overflow-hidden flex">
                      <div className="w-1/3 bg-neo-yellow border-r-2 border-black" />
                      <div
                        className={cn(
                          'w-1/3 border-r-2 border-black transition-all',
                          isPreparing || isReady ? 'bg-neo-blue' : 'bg-transparent'
                        )}
                      />
                      <div
                        className={cn(
                          'w-1/3 transition-all',
                          isReady ? 'bg-neo-green' : 'bg-transparent'
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="py-3 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                    Ordered Items
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 border-2 border-black text-xs font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-neo-yellow px-1.5 py-0.5 border border-black font-black">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-black">{item.menuItem?.name}</span>
                        </div>
                        <span>{formatPrice(item.priceAtOrder * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes & Pickup */}
                <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
                  <div className="space-y-1">
                    <p className="text-neutral-600">
                      <span className="font-black text-black">Pickup Slot:</span> {order.pickupTime}
                    </p>
                    {order.notes && (
                      <p className="text-neutral-600">
                        <span className="font-black text-black">Note:</span> {order.notes}
                      </p>
                    )}
                    {order.cancelledReason && (
                      <p className="text-neo-red font-black">
                        Cancelled: {order.cancelledReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-neutral-500 text-xs block">Total Amount</span>
                      <span className="text-lg font-black bg-neo-yellow px-2 py-0.5 border-2 border-black">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    {isPending && (
                      <NeoButton
                        variant="destructive"
                        size="sm"
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <XCircle size={14} />
                        <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                      </NeoButton>
                    )}
                  </div>
                </div>
              </NeoCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
