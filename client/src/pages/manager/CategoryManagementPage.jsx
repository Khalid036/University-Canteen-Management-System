import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Tags, Layers } from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoInput } from '../../components/ui/NeoInput';
import { NeoModal } from '../../components/ui/NeoModal';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional()
});

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(categorySchema)
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({ name: '', description: '', icon: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    reset({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, data);
      } else {
        await api.post('/categories', data);
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Menu items under it might be affected.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black p-5 shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <NeoBadge variant="yellow" size="sm">ORGANIZATION</NeoBadge>
          <h1 className="text-3xl font-black uppercase text-black mt-1">Menu Categories</h1>
          <p className="text-xs font-bold text-neutral-600">
            Manage food sections (Breakfast, Lunch, Snacks, Beverages, Desserts).
          </p>
        </div>

        <NeoButton variant="primary" size="lg" onClick={openCreateModal} className="gap-2">
          <Plus size={18} strokeWidth={3} /> Add Category
        </NeoButton>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 font-black">Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <NeoCard key={cat.id} className="border-4 shadow-neo bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏷️</span>
                    <h3 className="font-black text-lg uppercase text-black">{cat.name}</h3>
                  </div>
                  <NeoBadge variant="blue" size="sm">
                    {cat._count?.menuItems || 0} items
                  </NeoBadge>
                </div>
                <p className="text-xs font-bold text-neutral-600 mt-3">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t-2 border-black flex justify-end gap-2">
                <NeoButton variant="secondary" size="sm" onClick={() => openEditModal(cat)}>
                  <Edit2 size={14} /> Edit
                </NeoButton>
                <NeoButton variant="destructive" size="sm" onClick={() => handleDelete(cat.id, cat.name)}>
                  <Trash2 size={14} /> Delete
                </NeoButton>
              </div>
            </NeoCard>
          ))
        )}
      </div>

      {/* Modal */}
      <NeoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit: ${editingCategory.name}` : 'Create Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <NeoInput
            label="Category Name"
            placeholder="e.g. Gourmet Sandwiches"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Fresh artisan bread sandwiches and paninis..."
              className="w-full bg-white px-3.5 py-2 text-sm font-bold text-black border-3 border-black shadow-neo-sm focus:outline-none"
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
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </NeoButton>
          </div>
        </form>
      </NeoModal>
    </div>
  );
};
