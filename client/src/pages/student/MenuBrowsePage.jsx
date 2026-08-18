import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Filter, Leaf, Drumstick, Clock, Plus, Eye, ArrowUpDown } from 'lucide-react';
import api from '../../lib/axios';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoInput } from '../../components/ui/NeoInput';
import { NeoModal } from '../../components/ui/NeoModal';
import { formatPrice, cn } from '../../lib/utils';

export const MenuBrowsePage = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  // Quick View Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, menuRes] = await Promise.all([
          api.get('/categories'),
          api.get('/menu')
        ]);
        setCategories(catRes.data.data || []);
        setMenuItems(menuRes.data.data || []);
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (vegFilter === 'veg' && !item.isVeg) return false;
    if (vegFilter === 'non-veg' && item.isVeg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  const handleQuickAdd = (item, e) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const openItemDetails = (item) => {
    setSelectedItem(item);
    setModalQuantity(1);
  };

  return (
    <div className="space-y-8">
      {/* Teacher VIP Fast-Track Banner */}
      {isTeacher && (
        <div className="bg-neo-purple border-4 border-black p-4 shadow-neo flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white p-2 border-2 border-black">👑</span>
            <div>
              <h2 className="text-lg font-black uppercase text-black">
                Faculty Priority Ordering Enabled
              </h2>
              <p className="text-xs font-bold text-neutral-900">
                Your orders automatically receive top queue priority for fast counter pickup.
              </p>
            </div>
          </div>
          <NeoBadge variant="yellow" size="lg" className="shrink-0 animate-bounce">
            PRIORITY PASS ACTIVE
          </NeoBadge>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-neo-yellow border-4 border-black p-6 sm:p-8 shadow-neo-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <NeoBadge variant="dark" size="sm">FRESH DAILY MENU</NeoBadge>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
            What are you craving? 🍕
          </h1>
          <p className="text-sm font-bold text-neutral-800 max-w-xl">
            Order delicious meals, crispy snacks, and energizing coffees prepared fresh in the campus kitchen.
          </p>
        </div>

        {/* Search bar inside Hero */}
        <div className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, pasta, coffee..."
              className="w-full bg-white px-4 py-3 pl-11 text-sm font-bold text-black border-3 border-black shadow-neo-sm focus:outline-none placeholder-neutral-500"
            />
            <Search className="absolute left-3.5 top-3.5 text-black" size={18} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'neo-btn px-4 py-2 text-xs font-black uppercase tracking-wider shrink-0',
              selectedCategory === 'all' ? 'bg-black text-white' : 'bg-white text-black'
            )}
          >
            🌟 All Categories ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'neo-btn px-4 py-2 text-xs font-black uppercase tracking-wider shrink-0',
                selectedCategory === cat.id ? 'bg-neo-yellow text-black' : 'bg-white text-black'
              )}
            >
              {cat.name} ({cat._count?.menuItems || 0})
            </button>
          ))}
        </div>

        {/* Veg/Non-Veg & Sort Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border-3 border-black shadow-neo-sm">
          {/* Veg Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-neutral-600 flex items-center gap-1">
              <Filter size={14} /> Dietary:
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setVegFilter('all')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold border-2 border-black transition-colors',
                  vegFilter === 'all' ? 'bg-neo-yellow' : 'bg-neutral-100 hover:bg-neutral-200'
                )}
              >
                All
              </button>
              <button
                onClick={() => setVegFilter('veg')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold border-2 border-black flex items-center gap-1 transition-colors',
                  vegFilter === 'veg' ? 'bg-neo-green' : 'bg-neutral-100 hover:bg-neutral-200'
                )}
              >
                <Leaf size={12} className="text-emerald-800" /> Veg Only
              </button>
              <button
                onClick={() => setVegFilter('non-veg')}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold border-2 border-black flex items-center gap-1 transition-colors',
                  vegFilter === 'non-veg' ? 'bg-neo-red text-white' : 'bg-neutral-100 hover:bg-neutral-200'
                )}
              >
                <Drumstick size={12} /> Non-Veg
              </button>
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-neutral-600 flex items-center gap-1">
              <ArrowUpDown size={14} /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-100 px-2 py-1 text-xs font-bold border-2 border-black cursor-pointer"
            >
              <option value="popular">Popular / Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin text-5xl mb-3">🍳</div>
          <p className="font-black uppercase text-lg text-black">Cooking up the menu...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white border-3 border-black shadow-neo">
          <div className="text-6xl mb-3">🔍</div>
          <h3 className="font-black text-xl uppercase">No menu items found!</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1">
            Try adjusting your search terms or dietary filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isOutOfStock = item.stockQuantity <= 0 || !item.isAvailable;
            const isLowStock = item.stockQuantity > 0 && item.stockQuantity <= 5;

            return (
              <div
                key={item.id}
                onClick={() => openItemDetails(item)}
                className={cn(
                  'neo-card p-0 flex flex-col justify-between overflow-hidden cursor-pointer group transition-all duration-150',
                  'hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-lg',
                  isOutOfStock && 'opacity-70 bg-neutral-100'
                )}
              >
                <div>
                  {/* Item Image & Badges */}
                  <div className="relative h-48 bg-neutral-200 border-b-3 border-black overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-neo-yellow/30">
                        🍲
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {item.isVeg ? (
                        <NeoBadge variant="green" size="sm" className="gap-1">
                          <Leaf size={10} /> VEG
                        </NeoBadge>
                      ) : (
                        <NeoBadge variant="red" size="sm" className="gap-1">
                          <Drumstick size={10} /> NON-VEG
                        </NeoBadge>
                      )}
                      {item.category?.name && (
                        <NeoBadge variant="white" size="sm">
                          {item.category.name}
                        </NeoBadge>
                      )}
                    </div>

                    {/* Stock Alert Badge */}
                    {isOutOfStock ? (
                      <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-0.5 text-xs font-black border-2 border-white">
                        SOLD OUT
                      </div>
                    ) : isLowStock ? (
                      <div className="absolute bottom-2 right-2 bg-neo-orange text-black px-2 py-0.5 text-xs font-black border-2 border-black animate-pulse">
                        Only {item.stockQuantity} left!
                      </div>
                    ) : null}
                  </div>

                  {/* Item Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-base text-black uppercase group-hover:text-neo-pink transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="font-black text-base text-black bg-neo-yellow px-2 py-0.5 border-2 border-black shadow-neo-sm shrink-0">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-neutral-600 line-clamp-2">
                      {item.description || 'Freshly prepared meal from our kitchen.'}
                    </p>

                    <div className="flex items-center gap-3 text-xs font-bold text-neutral-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {item.prepTimeMinutes || 10}m prep
                      </span>
                      {item.calories && (
                        <span>• {item.calories} kcal</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 pt-0 flex gap-2">
                  <NeoButton
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openItemDetails(item);
                    }}
                    className="w-1/3 text-xs"
                  >
                    <Eye size={14} /> Details
                  </NeoButton>

                  <NeoButton
                    variant={isOutOfStock ? 'dark' : 'primary'}
                    size="sm"
                    disabled={isOutOfStock}
                    onClick={(e) => handleQuickAdd(item, e)}
                    className="w-2/3 text-xs justify-center"
                  >
                    <Plus size={14} strokeWidth={3} />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Tray'}</span>
                  </NeoButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      <NeoModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || 'Meal Details'}
      >
        {selectedItem && (
          <div className="space-y-4">
            {selectedItem.imageUrl && (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="w-full h-56 object-cover border-3 border-black shadow-neo"
              />
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {selectedItem.isVeg ? (
                  <NeoBadge variant="green" size="md">Vegetarian</NeoBadge>
                ) : (
                  <NeoBadge variant="red" size="md">Non-Vegetarian</NeoBadge>
                )}
                {selectedItem.category?.name && (
                  <NeoBadge variant="blue" size="md">{selectedItem.category.name}</NeoBadge>
                )}
              </div>
              <span className="text-2xl font-black bg-neo-yellow px-3 py-1 border-2 border-black shadow-neo-sm">
                {formatPrice(selectedItem.price)}
              </span>
            </div>

            <p className="text-sm font-bold text-neutral-800 leading-relaxed">
              {selectedItem.description || 'Delicious meal crafted with authentic ingredients.'}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-neo-bg border-2 border-black text-xs font-bold">
              <div>
                <span className="text-neutral-500 block">Preparation Time</span>
                <span className="font-black text-black">~{selectedItem.prepTimeMinutes || 10} minutes</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Available Stock</span>
                <span className="font-black text-black">{selectedItem.stockQuantity} units</span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <div className="flex items-center border-3 border-black bg-white shadow-neo-sm">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="px-3 py-2 font-black text-lg hover:bg-neo-yellow"
                >
                  -
                </button>
                <span className="px-4 py-2 font-black text-base">{modalQuantity}</span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.min(selectedItem.stockQuantity || 1, modalQuantity + 1))}
                  disabled={modalQuantity >= selectedItem.stockQuantity}
                  className="px-3 py-2 font-black text-lg hover:bg-neo-yellow disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <NeoButton
                variant="green"
                size="lg"
                disabled={selectedItem.stockQuantity <= 0}
                onClick={() => {
                  addItem(selectedItem, modalQuantity);
                  setSelectedItem(null);
                }}
                className="flex-1 justify-center"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Add {modalQuantity} to Tray ({formatPrice(selectedItem.price * modalQuantity)})</span>
              </NeoButton>
            </div>
          </div>
        )}
      </NeoModal>
    </div>
  );
};
