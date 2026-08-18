import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, GraduationCap, School, ChefHat } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoInput } from '../../components/ui/NeoInput';
import { NeoSelect } from '../../components/ui/NeoSelect';
import { cn } from '../../lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Valid university email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'TEACHER', 'MANAGER']),
  institutionId: z.string().min(1, 'Student ID or Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  phone: z.string().optional()
});

export const RegisterPage = () => {
  const { register: registerUser, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [regError, setRegError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
      department: 'Computer Science'
    }
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    setRegError(null);
    const result = await registerUser(data);
    if (result.success) {
      if (result.user.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/menu');
      }
    } else {
      setRegError(result.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">
        <NeoCard className="border-4 shadow-neo-lg bg-white">
          <NeoCardHeader className="bg-neo-pink -mx-5 -mt-5 p-5 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <NeoCardTitle className="text-2xl">Create Account</NeoCardTitle>
              <span className="text-2xl">🎓</span>
            </div>
            <p className="text-xs font-bold text-black mt-1">
              Select your university role and fill out your profile details.
            </p>
          </NeoCardHeader>

          {/* Role selector tabs */}
          <div className="mt-4 mb-6">
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('STUDENT')}
                className={cn(
                  'neo-btn p-2.5 text-xs font-extrabold flex flex-col items-center gap-1 border-2',
                  selectedRole === 'STUDENT' ? 'bg-neo-green text-black' : 'bg-white text-black'
                )}
              >
                <GraduationCap size={18} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('TEACHER')}
                className={cn(
                  'neo-btn p-2.5 text-xs font-extrabold flex flex-col items-center gap-1 border-2',
                  selectedRole === 'TEACHER' ? 'bg-neo-purple text-black' : 'bg-white text-black'
                )}
              >
                <School size={18} />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('MANAGER')}
                className={cn(
                  'neo-btn p-2.5 text-xs font-extrabold flex flex-col items-center gap-1 border-2',
                  selectedRole === 'MANAGER' ? 'bg-neo-yellow text-black' : 'bg-white text-black'
                )}
              >
                <ChefHat size={18} />
                <span>Manager</span>
              </button>
            </div>
          </div>

          {(regError || error) && (
            <div className="mb-4 p-3 bg-neo-red text-white border-2 border-black font-bold text-xs">
              ⚠️ {regError || error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('role')} value={selectedRole} />

            <NeoInput
              label="Full Name"
              placeholder="e.g. Sarah Connor"
              error={errors.name?.message}
              {...register('name')}
            />

            <NeoInput
              label="University Email"
              placeholder="e.g. sconnor@university.edu"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeoInput
                label={selectedRole === 'STUDENT' ? 'Student ID No.' : 'Employee / Staff ID'}
                placeholder="e.g. STU-9921"
                error={errors.institutionId?.message}
                {...register('institutionId')}
              />

              <NeoInput
                label="Department"
                placeholder="e.g. Computer Science"
                error={errors.department?.message}
                {...register('department')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeoInput
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <NeoInput
                label="Password"
                placeholder="••••••••"
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <NeoButton
              type="submit"
              variant="pink"
              size="lg"
              disabled={isLoading}
              className="w-full mt-4"
            >
              <UserPlus size={18} strokeWidth={3} />
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
            </NeoButton>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-black text-center text-xs font-bold">
            Already registered?{' '}
            <Link to="/login" className="text-black underline font-black hover:bg-neo-yellow px-1">
              Log in to your account
            </Link>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};
