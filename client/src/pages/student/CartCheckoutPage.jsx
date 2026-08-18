import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShoppingBag, Clock, Sparkles, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Utensils } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoInput } from '../../components/ui/NeoInput';
import { NeoSelect } from '../../components/ui/NeoSelect';
import { formatPrice } from '../../lib/utils';

export const CartCheckoutPage = () => {
  const {
    items,
    pickupTime,
    setPickupTime,
    notes,
    setNotes,
    isPriority,
    setPriority,
    clearCart,
    getTotalPrice,
    getTotalCount
  } = useCartStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const isTeacher = user?.role === 'TEACHER';
  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  const timeSlots = [
    { value: 'Immediate (ASAP)', label: '⚡ ASAP / Immediate Prep' },
    { value: '11:30 AM - 12:00 PM (Morning Slot)', label: '🥪 11:30 AM - 12:00 PM (Lunch Slot 1)' },
    { value: '12:15 PM - 12:45 PM (Peak Lunch)', label: '🍱 12:15 PM - 12:45 PM (Lunch Slot 2)' },
    { value: '01:00 PM - 01:30 PM (Afternoon)', label: '🍛 01:00 PM - 01:30 PM (Lunch Slot 3)' },
    { value: '03:30 PM - 04:00 PM (Tea & Snacks)', label: '☕ 03:30 PM - 04:00 PM (Tea Break)' },
    { value: '05:00 PM - 05:30 PM (Evening)', label: '🍔 05:00 PM - 05:30 PM (Evening Snacks)' }
  ];

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
        pickupTime,
        notes,
        isPriority: isTeacher ? true : isPriority
      };

      const res = await api.post('/orders', payload);
      const createdOrder = res.data.data;

      // Trigger festive celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      clearCart();
      setSuccessOrder(createdOrder);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <NeoCard className="border-4 shadow-neo-xl bg-white text-center p-8 space-y-6">
          <div className="w-20 h-20 bg-neo-green border-4 border-black shadow-neo mx-auto flex items-center justify-center text-4xl">
            🎉
          </div>

          <div>
            <NeoBadge variant="yellow" size="lg" className="mb-2">ORDER CONFIRMED</NeoBadge>
            <h1 className="text-3xl font-black uppercase text-black">
              Order #{successOrder.orderNumber}
            </h1>
            <p className="text-sm font-bold text-neutral-600 mt-1">
              Your meal order has been submitted to the canteen kitchen.
            </p>
          </div>

          <div className="bg-neo-bg border-3 border-black p-4 text-left space-y-2 text-xs font-bold">
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase">Pickup Slot:</span>
              <span className="text-black font-black">{successOrder.pickupTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase">Total Amount:</span>
              <span className="text-black font-black">{formatPrice(successOrder.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase">Queue Priority:</span>
              <span className="text-black font-black">
                {successOrder.isPriority ? '⚡ VIP Faculty Priority' : 'Standard Student Queue'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/orders">
              <NeoButton variant="primary" size="lg" className="w-full sm:w-auto">
                Track Order Status
              </NeoButton>
            </Link>
            <Link to="/menu">
              <NeoButton variant="secondary" size="lg" className="w-full sm:w-auto">
                Back to Menu
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-2xl font-black uppercase">Your tray is empty!</h2>
        <p className="text-xs font-bold text-neutral-600">
          You have no items in your order tray. Browse our menu to pick tasty food.
        </p>
        <Link to="/menu">
          <NeoButton variant="primary" size="lg">
            Browse Menu Now
          </NeoButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/menu" className="flex items-center gap-2 font-black text-xs uppercase hover:underline">
          <ArrowLeft size={16} strokeWidth={3} /> Continue Ordering
        </Link>
        <NeoBadge variant="pink" size="md">{totalCount} items in Tray</NeoBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items Review */}
        <div className="md:col-span-2 space-y-6">
          <NeoCard className="border-4 shadow-neo bg-white">
            <NeoCardHeader className="bg-neo-yellow -mx-5 -mt-5 p-4 border-b-3 border-black">
              <NeoCardTitle className="text-lg flex items-center gap-2">
                <Utensils size={18} /> 1. Tray Items Review
              </NeoCardTitle>
            </NeoCardHeader>

            <div className="divide-y-2 divide-black mt-2">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover border-2 border-black"
                      />
                    )}
                    <div>
                      <h4 className="font-black text-sm text-black">{item.name}</h4>
                      <p className="text-xs font-bold text-neutral-500">
                        {formatPrice(item.price)} × {item.quantity} units
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-base text-black bg-neutral-100 px-2 py-1 border-2 border-black">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </NeoCard>

          {/* Pickup & Preferences */}
          <NeoCard className="border-4 shadow-neo bg-white">
            <NeoCardHeader className="bg-neo-blue -mx-5 -mt-5 p-4 border-b-3 border-black">
              <NeoCardTitle className="text-lg flex items-center gap-2">
                <Clock size={18} /> 2. Pickup & Instructions
              </NeoCardTitle>
            </NeoCardHeader>

            <div className="space-y-4 mt-2">
              <NeoSelect
                label="Select Scheduled Pickup Time Slot"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                options={timeSlots}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Special Kitchen Instructions / Allergies (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra napkins, sauce on the side, no onions..."
                  rows={3}
                  className="w-full bg-white px-3.5 py-2 text-sm font-bold text-black border-3 border-black shadow-neo-sm focus:outline-none placeholder-neutral-500"
                />
              </div>

              {/* Priority tag banner for Teacher */}
              {isTeacher && (
                <div className="p-3 bg-neo-purple border-3 border-black flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black">
                    <Sparkles size={16} /> Faculty Priority Fast-Track Applied
                  </div>
                  <NeoBadge variant="yellow" size="sm">FREE BENEFIT</NeoBadge>
                </div>
              )}
            </div>
          </NeoCard>
        </div>

        {/* Summary Card & Payment */}
        <div className="space-y-6">
          <NeoCard className="border-4 shadow-neo-lg bg-white sticky top-24">
            <NeoCardHeader className="bg-neo-green -mx-5 -mt-5 p-4 border-b-3 border-black">
              <NeoCardTitle className="text-lg">Order Summary</NeoCardTitle>
            </NeoCardHeader>

            <div className="space-y-3 text-xs font-bold pt-2">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax & Service</span>
                <span className="text-emerald-700 font-black">INCLUDED (0.00)</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Payment Mode</span>
                <span className="bg-neo-yellow px-1.5 py-0.5 border border-black text-black">
                  Pay at Counter / Campus ID
                </span>
              </div>

              <div className="pt-3 border-t-3 border-black flex justify-between items-center text-lg font-black">
                <span>Total Due</span>
                <span className="text-2xl bg-neo-yellow px-2 py-1 border-3 border-black shadow-neo-sm">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-2.5 bg-neo-red text-white text-xs font-bold border-2 border-black">
                ⚠️ {errorMessage}
              </div>
            )}

            <NeoButton
              variant="green"
              size="lg"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full mt-6 justify-center"
            >
              <CheckCircle2 size={18} strokeWidth={3} />
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            </NeoButton>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-bold text-neutral-500">
              <ShieldCheck size={14} /> Instant notification to kitchen display
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
};
