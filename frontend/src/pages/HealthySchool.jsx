import React from 'react';
import { Heart, Plus } from 'lucide-react';

const HealthySchool = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Escola Saudável</h1>
          <p className="text-secondary-600">Promova saúde e bem-estar na comunidade escolar</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Healthy School Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo Escola Saudável</h3>
            <p>Interface para programas de saúde e bem-estar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthySchool;
