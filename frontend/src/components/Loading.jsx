import React from 'react';
import { Loader2, RefreshCw, Clock, AlertCircle } from 'lucide-react';

// Loading Spinner Base
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Loading com texto
export const LoadingWithText = ({ 
  text = 'Carregando...', 
  size = 'md',
  className = '',
  textClassName = ''
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LoadingSpinner size={size} className="text-blue-500" />
      <span className={`text-gray-600 ${textClassName}`}>
        {text}
      </span>
    </div>
  );
};

// Loading para cards
export const CardLoading = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

// Loading para tabelas
export const TableLoading = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="animate-pulse flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="animate-pulse flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading para lista
export const ListLoading = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading overlay
export const LoadingOverlay = ({ 
  isVisible, 
  text = 'Carregando...', 
  backdrop = true,
  className = '' 
}) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {backdrop && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      )}
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="xl" className="text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {text}
          </h3>
          <p className="text-sm text-gray-500">
            Aguarde enquanto processamos sua solicitação...
          </p>
        </div>
      </div>
    </div>
  );
};

// Loading com progresso
export const LoadingProgress = ({ 
  progress = 0, 
  text = 'Carregando...', 
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{text}</span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

// Loading para calendário
export const CalendarLoading = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week days */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded border">
              <div className="p-2">
                <div className="h-4 bg-gray-200 rounded w-6 mb-2"></div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading state component
export const LoadingState = ({ 
  type = 'card',
  error = null,
  retry = null,
  ...props 
}) => {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar
        </h3>
        <p className="text-gray-600 mb-4">
          {error.message || 'Ocorreu um erro inesperado'}
        </p>
        {retry && (
          <button 
            onClick={retry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar novamente</span>
          </button>
        )}
      </div>
    );
  }

  switch (type) {
    case 'table':
      return <TableLoading {...props} />;
    case 'list':
      return <ListLoading {...props} />;
    case 'calendar':
      return <CalendarLoading {...props} />;
    case 'overlay':
      return <LoadingOverlay isVisible={true} {...props} />;
    case 'progress':
      return <LoadingProgress {...props} />;
    case 'card':
    default:
      return <CardLoading {...props} />;
  }
};

// Hook para estados de loading
import { useState, useCallback } from 'react';

export const useAsyncState = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  const retry = useCallback(() => {
    if (error) {
      execute();
    }
  }, [execute, error]);

  return {
    loading,
    error,
    data,
    execute,
    retry
  };
};

export default LoadingState;
