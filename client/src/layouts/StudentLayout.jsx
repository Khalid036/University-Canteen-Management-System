import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { CartDrawer } from '../components/common/CartDrawer';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neo-bg">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <CartDrawer />
      <footer className="border-t-3 border-black bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-black uppercase tracking-wider text-neutral-700">
          CampusBites University Canteen Management System • Neubrutalism UI
        </div>
      </footer>
    </div>
  );
};
