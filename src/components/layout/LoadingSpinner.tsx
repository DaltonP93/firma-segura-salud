import React from 'react';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
);

export default LoadingSpinner;