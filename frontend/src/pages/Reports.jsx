import React from 'react';
import { FileText, Download } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Relatórios</h1>
          <p className="text-secondary-600">Gere relatórios e análises da pastoral escolar</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Gerar Relatório</span>
        </button>
      </div>

      {/* Reports Content */}
      <div className="card">
        <div className="flex items-center justify-center h-96 text-secondary-500">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-xl font-medium mb-2">Módulo de Relatórios</h3>
            <p>Interface para geração de relatórios e análises.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
