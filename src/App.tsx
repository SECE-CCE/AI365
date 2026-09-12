import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './context/AuthContext';
import { router } from './router';

export function App() {
  const isProd = typeof window !== 'undefined' && Boolean((import.meta as any).env?.PROD);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
      {isProd && <SpeedInsights />}
    </AuthProvider>
  );
}

export default App;
