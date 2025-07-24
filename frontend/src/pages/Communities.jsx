import React from 'react';
import { MapPin, Plus } from 'lucide-react';

const Communities = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Comunidades</h1>
          <p className="text-secondary-600">Gerencie as comunidades e grupos da pastoral</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Comunidade</span>
        </button>
      </div>

      {/* Communities Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo de Comunidades</h3>
            <p>Interface para gerenciamento de comunidades e grupos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communities;
