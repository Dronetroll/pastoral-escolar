import React from 'react';
import { DollarSign, Plus } from 'lucide-react';

const Collections = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Recoltas</h1>
          <p className="text-secondary-600">Controle de ofertas, dízimos e campanhas</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Recolta</span>
        </button>
      </div>

      {/* Collections Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo de Recoltas</h3>
            <p>Interface para controle financeiro de ofertas e campanhas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;
