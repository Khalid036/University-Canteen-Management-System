import React, { useEffect, useState } from 'react';
import { Boxes, Plus, Minus, AlertTriangle, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { formatPrice } from '../../lib/utils';

export const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menu');
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockAdjust = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    setUpdatingId(id);
    try {
      await api.patch(`/menu/${id}/stock`, {
        stockQuantity: newStock,
        isAvailable: newStock > 0
      });
      await fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAvailable = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/menu/${id}/stock`, {
        isAvailable: !currentStatus
      });
      await fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle availability');
    } finally {
      setUpdatingId(null);
    }
  };

  const lowStockCount = items.filter((i) => i.stockQuantity <= 5).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black p-5 shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <NeoBadge variant="yellow" size="sm">STOCK HEALTH</NeoBadge>
          <h1 className="text-3xl font-black uppercase text-black mt-1">Inventory & Stock Levels</h1>
          <p className="text-xs font-bold text-neutral-600">
            Track remaining dish quantities, adjust counts quickly, and manage kitchen availability.
          </p>
        </div>

        <div className="flex gap-2">
          {lowStockCount > 0 && (
            <NeoBadge variant="red" size="lg" className="animate-pulse gap-1">
              <AlertTriangle size={14} /> {lowStockCount} Low Stock Items!
            </NeoBadge>
          )}
          <NeoButton variant="secondary" size="md" onClick={fetchInventory} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </NeoButton>
        </div>
      </div>

      {/* Inventory Table */}
      <NeoCard className="border-4 shadow-neo bg-white p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neo-yellow border-b-3 border-black text-xs font-black uppercase tracking-wider text-black">
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Quick Adjust Stock</th>
                <th className="p-4">Ordering Active</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-bold">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-black">
                    Loading inventory stock...
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.stockQuantity <= 5;
                  const isOut = item.stockQuantity === 0;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 object-cover border-2 border-black shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-black text-sm text-black">{item.name}</div>
                          <div className="text-neutral-500">{formatPrice(item.price)}</div>
                        </div>
                      </td>

                      <td className="p-4">
                        <NeoBadge variant="white" size="sm">{item.category?.name || 'General'}</NeoBadge>
                      </td>

                      <td className="p-4 font-black">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              isOut
                                ? 'text-white bg-neo-red px-2 py-1 border border-black'
                                : isLow
                                ? 'text-black bg-neo-orange px-2 py-1 border border-black'
                                : 'text-black bg-neo-green px-2 py-1 border border-black'
                            }
                          >
                            {item.stockQuantity} units
                          </span>
                          {isLow && (
                            <span className="text-[11px] text-red-600 font-extrabold uppercase">
                              Low Stock!
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockAdjust(item.id, item.stockQuantity, -5)}
                            disabled={updatingId === item.id || item.stockQuantity < 5}
                            className="neo-btn px-2 py-1 text-xs bg-white hover:bg-neutral-200 border-2"
                            title="Subtract 5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, item.stockQuantity, -1)}
                            disabled={updatingId === item.id || item.stockQuantity <= 0}
                            className="neo-btn px-2 py-1 text-xs bg-white hover:bg-neutral-200 border-2"
                            title="Subtract 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, item.stockQuantity, 1)}
                            disabled={updatingId === item.id}
                            className="neo-btn px-2 py-1 text-xs bg-neo-yellow hover:bg-yellow-300 border-2"
                            title="Add 1"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, item.stockQuantity, 10)}
                            disabled={updatingId === item.id}
                            className="neo-btn px-2 py-1 text-xs bg-neo-green hover:bg-emerald-300 border-2"
                            title="Restock 10"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailable(item.id, item.isAvailable)}
                          disabled={updatingId === item.id}
                          className={
                            item.isAvailable
                              ? 'neo-btn px-3 py-1 bg-neo-green text-xs border-2'
                              : 'neo-btn px-3 py-1 bg-neo-red text-white text-xs border-2'
                          }
                        >
                          {item.isAvailable ? '✅ Available' : '🚫 Disabled'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </NeoCard>
    </div>
  );
};
