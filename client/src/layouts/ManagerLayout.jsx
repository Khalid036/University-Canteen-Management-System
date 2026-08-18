import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Boxes,
  BarChart3,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';

export const ManagerLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/manager', label: 'Live Order Board', icon: LayoutDashboard, exact: true },
    { path: '/manager/menu', label: 'Menu Management', icon: UtensilsCrossed },
    { path: '/manager/categories', label: 'Categories', icon: Tags },
    { path: '/manager/inventory', label: 'Inventory & Stock', icon: Boxes },
    { path: '/manager/reports', label: 'Sales & Reports', icon: BarChart3 },
    { path: '/manager/users', label: 'User Directory', icon: Users }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neo-bg">
      <Navbar />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Manager Navigation Bar */}
        <div className="flex flex-wrap gap-2 mb-6 border-b-3 border-black pb-4">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <button
                  className={cn(
                    'neo-btn flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider',
                    isActive ? 'bg-neo-yellow text-black' : 'bg-white text-black hover:bg-neutral-100'
                  )}
                >
                  <Icon size={16} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
