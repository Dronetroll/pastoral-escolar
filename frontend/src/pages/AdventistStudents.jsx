import React from 'react';
import { GraduationCap, Plus, Search } from 'lucide-react';

const AdventistStudents = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Alunos Adventistas</h1>
          <p className="text-secondary-600">Gerencie e acompanhe os alunos adventistas da escola</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Aluno</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar alunos..."
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="form-input">
              <option>Todas as turmas</option>
              <option>1º Ano</option>
              <option>2º Ano</option>
              <option>3º Ano</option>
            </select>
            <select className="form-input">
              <option>Status: Todos</option>
              <option>Ativos</option>
              <option>Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo de Alunos Adventistas</h3>
            <p>Interface para gerenciamento completo dos alunos adventistas.</p>
            <p className="mt-2 text-sm">Este módulo possui API backend completa implementada.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdventistStudents;
