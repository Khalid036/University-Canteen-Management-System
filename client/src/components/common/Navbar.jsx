import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  UtensilsCrossed,
  User,
  LogOut,
  Sparkles,
  ClipboardList,
  LayoutDashboard,
  Menu as MenuIcon,
  X,
  Crown,
  ChefHat
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { NeoButton } from '../ui/NeoButton';
import { NeoBadge } from '../ui/NeoBadge';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getTotalCount, toggleDrawer } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartItems = getTotalCount();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isTeacher = user?.role === 'TEACHER';
  const isManager = user?.role === 'MANAGER';
  const isStudent = user?.role === 'STUDENT';

  return (
    <header className="sticky top-0 z-40 bg-white border-b-4 border-black shadow-neo-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 bg-neo-yellow border-3 border-black shadow-neo-sm flex items-center justify-center font-black text-2xl group-hover:rotate-6 transition-transform">
                🍔
              </div>
              <div>
                <span className="text-2xl font-black uppercase tracking-tight text-black block leading-none">
                  Campus<span className="bg-neo-pink px-1.5 py-0.5 border-2 border-black ml-1 text-sm shadow-neo-sm">BITES</span>
                </span>
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                  University Canteen
                </span>
              </div>
            </Link>

            {/* Role indicator pill */}
            {user && (
              <div className="hidden md:flex ml-2">
                {isManager && (
                  <NeoBadge variant="pink" size="md" className="gap-1 animate-pulse">
                    <ChefHat size={14} /> Manager Portal
                  </NeoBadge>
                )}
                {isTeacher && (
                  <NeoBadge variant="purple" size="md" className="gap-1">
                    <Crown size={14} /> Faculty / Priority
                  </NeoBadge>
                )}
                {isStudent && (
                  <NeoBadge variant="green" size="md">
                    🎓 Student
                  </NeoBadge>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Standard Student/Teacher nav */}
                {!isManager && (
                  <>
                    <Link to="/menu">
                      <NeoButton
                        variant={location.pathname === '/menu' ? 'primary' : 'outline'}
                        size="md"
                      >
                        <UtensilsCrossed size={16} /> Browse Menu
                      </NeoButton>
                    </Link>
                    <Link to="/orders">
                      <NeoButton
                        variant={location.pathname === '/orders' ? 'primary' : 'outline'}
                        size="md"
                      >
                        <ClipboardList size={16} /> My Orders
                      </NeoButton>
                    </Link>
                  </>
                )}

                {/* Manager Nav */}
                {isManager && (
                  <>
                    <Link to="/manager">
                      <NeoButton
                        variant={location.pathname === '/manager' ? 'primary' : 'outline'}
                        size="md"
                      >
                        <LayoutDashboard size={16} /> Live Orders
                      </NeoButton>
                    </Link>
                    <Link to="/manager/menu">
                      <NeoButton
                        variant={location.pathname.startsWith('/manager/menu') ? 'primary' : 'outline'}
                        size="md"
                      >
                        Menu CRUD
                      </NeoButton>
                    </Link>
                    <Link to="/manager/reports">
                      <NeoButton
                        variant={location.pathname === '/manager/reports' ? 'primary' : 'outline'}
                        size="md"
                      >
                        Sales Reports
                      </NeoButton>
                    </Link>
                  </>
                )}

                {/* Cart Drawer Trigger for students / teachers */}
                {!isManager && (
                  <NeoButton
                    variant="green"
                    size="md"
                    onClick={toggleDrawer}
                    className="relative ml-2"
                  >
                    <ShoppingBag size={18} strokeWidth={3} />
                    <span>Cart</span>
                    {totalCartItems > 0 && (
                      <span className="bg-neo-red text-white text-xs font-black px-2 py-0.5 border-2 border-black shadow-neo-sm ml-1 rounded-none">
                        {totalCartItems}
                      </span>
                    )}
                  </NeoButton>
                )}

                {/* Profile & User dropdown */}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l-2 border-black">
                  <Link to="/profile">
                    <NeoButton variant="secondary" size="md" className="gap-2">
                      <User size={16} />
                      <span className="max-w-[120px] truncate">{user?.name?.split(' ')[0]}</span>
                    </NeoButton>
                  </Link>

                  <NeoButton
                    variant="destructive"
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut size={16} strokeWidth={3} />
                  </NeoButton>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <NeoButton variant="secondary" size="md">
                    Log In
                  </NeoButton>
                </Link>
                <Link to="/register">
                  <NeoButton variant="primary" size="md">
                    Register
                  </NeoButton>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {!isManager && isAuthenticated && (
              <NeoButton variant="green" size="icon" onClick={toggleDrawer} className="relative">
                <ShoppingBag size={20} strokeWidth={3} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-neo-red text-white text-xs font-black px-1.5 py-0.5 border-2 border-black shadow-neo-sm">
                    {totalCartItems}
                  </span>
                )}
              </NeoButton>
            )}
            <NeoButton
              variant="secondary"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={3} /> : <MenuIcon size={22} strokeWidth={3} />}
            </NeoButton>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-3 border-black bg-neo-yellow p-4 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="bg-white p-3 border-2 border-black shadow-neo-sm mb-3">
                <p className="font-extrabold text-sm text-black">{user?.name}</p>
                <p className="text-xs font-bold text-neutral-600">{user?.email} • {user?.role}</p>
              </div>

              {!isManager ? (
                <>
                  <Link to="/menu" onClick={() => setMobileMenuOpen(false)}>
                    <NeoButton variant="secondary" size="md" className="w-full justify-start mb-2">
                      <UtensilsCrossed size={16} /> Browse Menu
                    </NeoButton>
                  </Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                    <NeoButton variant="secondary" size="md" className="w-full justify-start mb-2">
                      <ClipboardList size={16} /> My Orders
                    </NeoButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/manager" onClick={() => setMobileMenuOpen(false)}>
                    <NeoButton variant="secondary" size="md" className="w-full justify-start mb-2">
                      <LayoutDashboard size={16} /> Live Orders
                    </NeoButton>
                  </Link>
                  <Link to="/manager/menu" onClick={() => setMobileMenuOpen(false)}>
                    <NeoButton variant="secondary" size="md" className="w-full justify-start mb-2">
                      Menu CRUD
                    </NeoButton>
                  </Link>
                  <Link to="/manager/reports" onClick={() => setMobileMenuOpen(false)}>
                    <NeoButton variant="secondary" size="md" className="w-full justify-start mb-2">
                      Sales Reports
                    </NeoButton>
                  </Link>
                  <Link to="/manager/inventory" onClick={() => setMobileMenuOpen(false)}>
                    <NeoButton variant="secondary" size="md" className="w-full justify-start mb-2">
                      Inventory
                    </NeoButton>
                  </Link>
                </>
              )}

              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <NeoButton variant="secondary" size="md" className="w-full justify-start mb-2">
                  <User size={16} /> My Profile
                </NeoButton>
              </Link>
              <NeoButton variant="destructive" size="md" onClick={handleLogout} className="w-full justify-start">
                <LogOut size={16} /> Log Out
              </NeoButton>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <NeoButton variant="secondary" size="md" className="w-full mb-2">
                  Log In
                </NeoButton>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <NeoButton variant="primary" size="md" className="w-full">
                  Register Account
                </NeoButton>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
