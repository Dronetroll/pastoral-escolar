import React from 'react';

const Cronograma = () => {
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow p-6 border border-secondary-200">
      <h2 className="text-2xl font-bold text-red-700 mb-4">Cronograma/horários</h2>
      <ul className="space-y-3">
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-secondary-900">07:30 - 08:30</span>
          <span className="text-secondary-500">Abertura e Oração</span>
        </li>
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-secondary-900">08:30 - 10:00</span>
          <span className="text-secondary-500">Atividades Pastorais</span>
        </li>
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-secondary-900">10:00 - 10:30</span>
          <span className="text-secondary-500">Intervalo</span>
        </li>
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="font-medium text-secondary-900">10:30 - 12:00</span>
          <span className="text-secondary-500">Estudo Bíblico</span>
        </li>
      </ul>
    </div>
  );
};

export default Cronograma;
