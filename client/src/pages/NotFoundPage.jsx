import React from 'react';
import { Link } from 'react-router-dom';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <NeoCard className="border-4 shadow-neo-xl bg-white text-center p-8 max-w-md space-y-4">
        <div className="text-6xl">🥪</div>
        <h1 className="text-4xl font-black uppercase text-black">404</h1>
        <h2 className="text-xl font-black uppercase">Page Not Found</h2>
        <p className="text-xs font-bold text-neutral-600">
          The dish or page you are looking for is not on the canteen menu!
        </p>
        <Link to="/" className="inline-block mt-2">
          <NeoButton variant="primary" size="lg">
            Return to Home / Menu
          </NeoButton>
        </Link>
      </NeoCard>
    </div>
  );
};
