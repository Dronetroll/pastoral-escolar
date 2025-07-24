import React, { useState } from 'react';
import ResponsiveCalendar from '../components/ResponsiveCalendar';

const CalendarResponsiveDemo = () => {
  const [selectedDevice, setSelectedDevice] = useState('desktop');

  const devices = {
    mobile: { width: '375px', height: '667px', name: 'iPhone SE' },
    tablet: { width: '768px', height: '1024px', name: 'iPad' },
    desktop: { width: '100%', height: '100vh', name: 'Desktop' }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Teste de Responsividade - Calendário Pastoral
        </h1>
        
        <div className="flex space-x-4 mb-4">
          {Object.entries(devices).map(([key, device]) => (
            <button
              key={key}
              onClick={() => setSelectedDevice(key)}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedDevice === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {device.name}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Dispositivo atual: <strong>{devices[selectedDevice].name}</strong>
          {selectedDevice !== 'desktop' && (
            <span> ({devices[selectedDevice].width} x {devices[selectedDevice].height})</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <div 
          className="mx-auto transition-all duration-300 ease-in-out"
          style={{
            width: devices[selectedDevice].width,
            height: devices[selectedDevice].height,
            maxWidth: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: selectedDevice !== 'desktop' ? '1px solid #e5e7eb' : 'none',
            borderRadius: selectedDevice !== 'desktop' ? '12px' : '0'
          }}
        >
          <ResponsiveCalendar />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recursos de Responsividade Implementados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">📱 Mobile First</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Menu hambúrguer responsivo</li>
              <li>• Controles touch-friendly</li>
              <li>• Visualização adaptativa</li>
              <li>• Scroll horizontal otimizado</li>
            </ul>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">💻 Desktop</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Filtros laterais expandidos</li>
              <li>• Grid completo do calendário</li>
              <li>• Múltiplas visualizações</li>
              <li>• Interações com mouse</li>
            </ul>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">🎯 Acessibilidade</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Alto contraste suportado</li>
              <li>• Redução de movimento</li>
              <li>• Tamanhos touch adequados</li>
              <li>• Navegação por teclado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarResponsiveDemo;
