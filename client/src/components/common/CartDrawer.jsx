import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { NeoButton } from '../ui/NeoButton';
import { NeoBadge } from '../ui/NeoBadge';
import { formatPrice } from '../../lib/utils';

export const CartDrawer = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getTotalCount
  } = useCartStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isTeacher = user?.role === 'TEACHER';
  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  if (!isDrawerOpen) return null;

  const handleCheckoutClick = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Slide Drawer Content */}
      <div className="relative w-full max-w-md bg-neo-bg border-l-4 border-black shadow-neo-xl h-full flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-black bg-neo-yellow p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-xl uppercase tracking-tight text-black">
              Your Food Tray
            </h3>
            <span className="bg-black text-white text-xs font-black px-2 py-0.5 border-2 border-black">
              {totalCount} items
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1 bg-white border-2 border-black shadow-neo-sm hover:bg-neo-red hover:text-white transition-colors"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Teacher priority banner */}
        {isTeacher && (
          <div className="bg-neo-purple border-b-3 border-black px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black">
              <Sparkles size={16} /> Faculty Priority Queue Active
            </div>
            <NeoBadge variant="yellow" size="sm">FAST-TRACK</NeoBadge>
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4">🥣</div>
              <h4 className="font-black text-lg uppercase text-black">Your tray is empty!</h4>
              <p className="text-xs font-bold text-neutral-600 mt-1 max-w-xs mx-auto">
                Add some tasty hot meals, crispy snacks, or iced drinks from our menu.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white border-3 border-black p-3 shadow-neo-sm flex gap-3 items-center"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover border-2 border-black shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-black truncate">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-black text-black">{formatPrice(item.price)}</span>
                    <span className="text-xs font-bold text-neutral-500">
                      Total: {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border-2 border-black bg-neutral-100 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-neo-yellow transition-colors"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="px-2 text-xs font-black">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= (item.stockQuantity || 99)}
                    className="p-1 hover:bg-neo-yellow transition-colors disabled:opacity-30"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>

                {/* Remove item */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-neutral-500 hover:text-neo-red transition-colors"
                  title="Remove"
                >
                  <Trash2 size={16} strokeWidth={2.5} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals and checkout */}
        {items.length > 0 && (
          <div className="border-t-3 border-black bg-white p-4 space-y-3">
            <div className="space-y-1.5 text-sm font-bold">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated Prep Time</span>
                <span className="flex items-center gap-1"><Clock size={14} /> ~10-15 mins</span>
              </div>
              <div className="flex justify-between text-lg font-black text-black pt-2 border-t-2 border-black">
                <span>Grand Total</span>
                <span className="text-xl text-black bg-neo-yellow px-2 py-0.5 border-2 border-black">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <NeoButton
                variant="outline"
                size="md"
                onClick={clearCart}
                className="w-1/3 text-xs"
              >
                Clear
              </NeoButton>
              <NeoButton
                variant="green"
                size="lg"
                onClick={handleCheckoutClick}
                className="w-2/3 justify-between"
              >
                <span>Checkout</span>
                <ArrowRight size={18} strokeWidth={3} />
              </NeoButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
