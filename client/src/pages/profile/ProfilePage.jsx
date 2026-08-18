import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, School, Shield, Phone, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoInput } from '../../components/ui/NeoInput';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().optional(),
  phone: z.string().optional(),
  institutionId: z.string().optional()
});

export const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      department: user?.department || '',
      phone: user?.phone || '',
      institutionId: user?.institutionId || ''
    }
  });

  const onSubmit = async (data) => {
    setSuccessMsg(false);
    const res = await updateProfile(data);
    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <NeoCard className="border-4 shadow-neo-lg bg-white">
        <NeoCardHeader className="bg-neo-yellow -mx-5 -mt-5 p-5 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white border-3 border-black flex items-center justify-center text-2xl font-black shadow-neo-sm">
                👤
              </div>
              <div>
                <NeoCardTitle className="text-2xl">{user?.name}</NeoCardTitle>
                <p className="text-xs font-bold text-neutral-800">{user?.email}</p>
              </div>
            </div>

            {user?.role === 'TEACHER' && (
              <NeoBadge variant="purple" size="md">FACULTY / PRIORITY</NeoBadge>
            )}
            {user?.role === 'MANAGER' && (
              <NeoBadge variant="pink" size="md">CANTEEN MANAGER</NeoBadge>
            )}
            {user?.role === 'STUDENT' && (
              <NeoBadge variant="green" size="md">STUDENT</NeoBadge>
            )}
          </div>
        </NeoCardHeader>

        {successMsg && (
          <div className="mb-4 p-3 bg-neo-green border-2 border-black text-black font-black text-xs flex items-center gap-2">
            <CheckCircle2 size={16} /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <NeoInput
            label="Full Name"
            error={errors.name?.message}
            {...register('name')}
          />

          <NeoInput
            label="Institutional ID (Student ID / Staff ID)"
            error={errors.institutionId?.message}
            {...register('institutionId')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoInput
              label="Department"
              error={errors.department?.message}
              {...register('department')}
            />

            <NeoInput
              label="Contact Phone"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div className="p-3 bg-neo-bg border-2 border-black text-xs font-bold space-y-1">
            <p className="text-neutral-500 uppercase">Account Role & Privileges</p>
            <p className="text-black font-black">
              {user?.role === 'TEACHER' && '🎓 Faculty member — Entitled to Priority Queue & Pre-order slots.'}
              {user?.role === 'STUDENT' && '🎓 Student member — Standard canteen queue with real-time status.'}
              {user?.role === 'MANAGER' && '🍳 Canteen Administrator — Full access to Menu CRUD, Live Orders, & Analytics.'}
            </p>
          </div>

          <NeoButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full mt-4"
          >
            <Save size={18} strokeWidth={3} />
            <span>{isLoading ? 'Saving...' : 'Save Profile Changes'}</span>
          </NeoButton>
        </form>
      </NeoCard>
    </div>
  );
};
