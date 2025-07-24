import React from 'react';
import { Users, Plus } from 'lucide-react';

const Collaborators = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Colaboradores</h1>
          <p className="text-secondary-600">Gerencie a equipe de colaboradores da pastoral</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Colaborador</span>
        </button>
      </div>

      {/* Collaborators Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo de Colaboradores</h3>
            <p>Interface para gerenciamento de colaboradores e equipe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collaborators;
