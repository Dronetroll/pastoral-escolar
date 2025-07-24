import React from 'react';
import { PartyPopper, Plus } from 'lucide-react';

const Events = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Eventos</h1>
          <p className="text-secondary-600">Organize e gerencie eventos da pastoral escolar</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Evento</span>
        </button>
      </div>

      {/* Events Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <PartyPopper className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo de Eventos</h3>
            <p>Interface para planejamento e organização de eventos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
