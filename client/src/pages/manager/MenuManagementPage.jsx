import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Image, Search, Leaf, Drumstick, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoInput } from '../../components/ui/NeoInput';
import { NeoSelect } from '../../components/ui/NeoSelect';
import { NeoModal } from '../../components/ui/NeoModal';
import { formatPrice, cn } from '../../lib/utils';

const itemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional(),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  isVeg: z.coerce.boolean().default(true),
  isAvailable: z.coerce.boolean().default(true),
  prepTimeMinutes: z.coerce.number().int().min(1).default(10),
  calories: z.coerce.number().int().optional()
});

export const MenuManagementPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      isVeg: true,
      isAvailable: true,
      stockQuantity: 20,
      prepTimeMinutes: 10
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get('/menu'),
        api.get('/categories')
      ]);
      setMenuItems(menuRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setSelectedFile(null);
    reset({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      stockQuantity: 25,
      isVeg: true,
      isAvailable: true,
      prepTimeMinutes: 10,
      calories: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setSelectedFile(null);
    reset({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      stockQuantity: item.stockQuantity,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      prepTimeMinutes: item.prepTimeMinutes || 10,
      calories: item.calories || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/menu', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/menu/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const filteredItems = menuItems.filter((i) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black p-5 shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <NeoBadge variant="pink" size="sm">MENU CRUD</NeoBadge>
          <h1 className="text-3xl font-black uppercase text-black mt-1">Menu Management</h1>
          <p className="text-xs font-bold text-neutral-600">
            Create, edit, upload photos, and manage prices & stock for canteen items.
          </p>
        </div>

        <NeoButton variant="primary" size="lg" onClick={openCreateModal} className="gap-2">
          <Plus size={18} strokeWidth={3} /> Add Menu Item
        </NeoButton>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 border-3 border-black shadow-neo-sm">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by title or keywords..."
            className="w-full bg-neutral-50 px-4 py-2.5 pl-10 text-sm font-bold text-black border-2 border-black focus:outline-none"
          />
          <Search className="absolute left-3 top-3 text-neutral-600" size={16} strokeWidth={3} />
        </div>
      </div>

      {/* Menu Table */}
      <NeoCard className="border-4 shadow-neo bg-white p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neo-yellow border-b-3 border-black text-xs font-black uppercase tracking-wider text-black">
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Diet</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-bold">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-black">
                    Loading menu catalogue...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500 font-bold">
                    No menu items found. Click "+ Add Menu Item" above to add one.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover border-2 border-black shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-neutral-200 border-2 border-black flex items-center justify-center text-lg">
                          🍲
                        </div>
                      )}
                      <div>
                        <div className="font-black text-sm text-black">{item.name}</div>
                        <div className="text-neutral-500 text-[11px] line-clamp-1">
                          {item.description || 'No description'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <NeoBadge variant="white" size="sm">{item.category?.name || 'General'}</NeoBadge>
                    </td>
                    <td className="p-4">
                      {item.isVeg ? (
                        <NeoBadge variant="green" size="sm" className="gap-1">
                          <Leaf size={10} /> Veg
                        </NeoBadge>
                      ) : (
                        <NeoBadge variant="red" size="sm" className="gap-1">
                          <Drumstick size={10} /> Non-Veg
                        </NeoBadge>
                      )}
                    </td>
                    <td className="p-4 font-black text-sm">
                      {formatPrice(item.price)}
                    </td>
                    <td className="p-4 font-black">
                      <span className={item.stockQuantity <= 5 ? 'text-neo-red font-black' : ''}>
                        {item.stockQuantity} units
                      </span>
                    </td>
                    <td className="p-4">
                      {item.isAvailable && item.stockQuantity > 0 ? (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle size={14} /> Available
                        </span>
                      ) : (
                        <span className="text-red-600 font-black flex items-center gap-1">
                          <XCircle size={14} /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NeoButton
                          variant="secondary"
                          size="icon"
                          onClick={() => openEditModal(item)}
                          title="Edit Item"
                        >
                          <Edit2 size={14} />
                        </NeoButton>
                        <NeoButton
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete Item"
                        >
                          <Trash2 size={14} />
                        </NeoButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </NeoCard>

      {/* Create / Edit Modal */}
      <NeoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit: ${editingItem.name}` : 'Add New Menu Item'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <NeoInput
            label="Dish / Item Name"
            placeholder="e.g. Double Smash Cheeseburger"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Crispy patties with melted cheddar cheese..."
              className="w-full bg-white px-3.5 py-2 text-sm font-bold text-black border-3 border-black shadow-neo-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoSelect
              label="Category"
              error={errors.categoryId?.message}
              {...register('categoryId')}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NeoSelect>

            <NeoInput
              label="Price ($ USD)"
              type="number"
              step="0.01"
              placeholder="5.50"
              error={errors.price?.message}
              {...register('price')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NeoInput
              label="Stock Units"
              type="number"
              placeholder="30"
              error={errors.stockQuantity?.message}
              {...register('stockQuantity')}
            />

            <NeoInput
              label="Prep Time (mins)"
              type="number"
              placeholder="10"
              error={errors.prepTimeMinutes?.message}
              {...register('prepTimeMinutes')}
            />

            <NeoInput
              label="Calories (kcal)"
              type="number"
              placeholder="450"
              error={errors.calories?.message}
              {...register('calories')}
            />
          </div>

          {/* Dietary & Availability Toggles */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-neo-bg border-2 border-black text-xs font-black">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-black"
                {...register('isVeg')}
              />
              <span>🥬 Vegetarian Dish</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-black"
                {...register('isAvailable')}
              />
              <span>✅ Item Available for Order</span>
            </label>
          </div>

          {/* Photo upload / URL */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Item Photography
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full bg-white p-2 border-2 border-black text-xs font-bold cursor-pointer"
            />
            <NeoInput
              label="Or Direct Image URL"
              placeholder="https://images.unsplash.com/..."
              {...register('imageUrl')}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <NeoButton
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsModalOpen(false)}
              className="w-1/3"
            >
              Cancel
            </NeoButton>
            <NeoButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-2/3 justify-center"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};
