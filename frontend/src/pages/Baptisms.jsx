import React from 'react';
import { Droplets, Plus } from 'lucide-react';

const Baptisms = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Batismos</h1>
          <p className="text-secondary-600">Registre e acompanhe os batismos realizados</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Registrar Batismo</span>
        </button>
      </div>

      {/* Baptisms Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <Droplets className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo de Batismos</h3>
            <p>Interface para registro e gerenciamento de batismos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Baptisms;
