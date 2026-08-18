import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Sparkles, ChefHat, GraduationCap, School } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard, NeoCardHeader, NeoCardTitle } from '../../components/ui/NeoCard';
import { NeoInput } from '../../components/ui/NeoInput';
import { NeoBadge } from '../../components/ui/NeoBadge';

const loginSchema = z.object({
  email: z.string().email('Valid university email required'),
  password: z.string().min(1, 'Password is required')
});

export const LoginPage = () => {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setAuthError(null);
    const result = await login(data.email, data.password);
    if (result.success) {
      if (result.user.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/menu');
      }
    } else {
      setAuthError(result.message);
    }
  };

  const handleDemoLogin = async (role) => {
    setAuthError(null);
    let email = 'student@canteen.edu';
    if (role === 'TEACHER') email = 'teacher@canteen.edu';
    if (role === 'MANAGER') email = 'manager@canteen.edu';

    setValue('email', email);
    setValue('password', 'password123');

    const result = await login(email, 'password123');
    if (result.success) {
      if (result.user.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/menu');
      }
    } else {
      setAuthError(result.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Card */}
        <NeoCard className="border-4 shadow-neo-lg bg-white">
          <NeoCardHeader className="bg-neo-yellow -mx-5 -mt-5 p-5 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <NeoCardTitle className="text-2xl">Sign In</NeoCardTitle>
              <span className="text-2xl">🍔</span>
            </div>
            <p className="text-xs font-bold text-black mt-1">
              Enter your credentials or click a Quick Demo role below.
            </p>
          </NeoCardHeader>

          {/* Quick Demo Logins Bar */}
          <div className="mt-4 mb-6 p-3 bg-neo-bg border-3 border-black space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black flex items-center gap-1">
                <Sparkles size={14} className="text-neo-orange" /> 1-Click Demo Logins:
              </span>
              <NeoBadge variant="pink" size="sm">TEST ACCOUNTS</NeoBadge>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('STUDENT')}
                className="neo-btn bg-white hover:bg-emerald-100 p-2 text-center text-xs font-extrabold flex flex-col items-center gap-1 border-2"
              >
                <GraduationCap size={16} className="text-emerald-700" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('TEACHER')}
                className="neo-btn bg-white hover:bg-purple-100 p-2 text-center text-xs font-extrabold flex flex-col items-center gap-1 border-2"
              >
                <School size={16} className="text-purple-700" />
                <span>Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('MANAGER')}
                className="neo-btn bg-white hover:bg-pink-100 p-2 text-center text-xs font-extrabold flex flex-col items-center gap-1 border-2"
              >
                <ChefHat size={16} className="text-pink-700" />
                <span>Manager</span>
              </button>
            </div>
          </div>

          {(authError || error) && (
            <div className="mb-4 p-3 bg-neo-red text-white border-2 border-black font-bold text-xs">
              ⚠️ {authError || error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <NeoInput
              label="Email Address"
              placeholder="e.g. student@canteen.edu"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <NeoInput
              label="Password"
              placeholder="••••••••"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />

            <NeoButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full mt-2"
            >
              <LogIn size={18} strokeWidth={3} />
              <span>{isLoading ? 'Signing In...' : 'Log In to CampusBites'}</span>
            </NeoButton>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-black text-center text-xs font-bold">
            Don't have an account?{' '}
            <Link to="/register" className="text-black underline font-black hover:bg-neo-yellow px-1">
              Create student / teacher account
            </Link>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};
