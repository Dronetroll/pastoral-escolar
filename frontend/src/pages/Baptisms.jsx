import React, { useState, useEffect } from 'react';
import { Droplets, Plus } from 'lucide-react';

const Baptisms = () => {
  const [baptisms, setBaptisms] = useState([]);

  useEffect(() => {
    fetch('/api/batismos')
      .then(res => res.json())
      .then(data => setBaptisms(data))
      .catch(err => console.error('Erro ao buscar batismos:', err));
  }, []);

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

      {/* Baptisms List */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Data</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Nome</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Local</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Pastor</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Igreja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {baptisms.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-sm">{new Date(item.dataBatismo).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-2 text-sm">{item.nome}</td>
                <td className="px-4 py-2 text-sm">{item.local || '-'}</td>
                <td className="px-4 py-2 text-sm">{item.pastor || '-'}</td>
                <td className="px-4 py-2 text-sm">{item.igreja || '-'}</td>
              </tr>
            ))}
            {baptisms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-secondary-500">
                  Nenhum batismo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Baptisms;
