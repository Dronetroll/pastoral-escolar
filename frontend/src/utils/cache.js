// Sistema de cache para melhorar performance do aplicativo
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos
  }

  // Definir item no cache
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
    
    // Salvar no localStorage para persistência
    try {
      const cacheData = {
        value,
        timestamp: Date.now() + ttl
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }

  // Obter item do cache
  get(key) {
    // Verificar se existe na memória
    if (this.cache.has(key)) {
      const timestamp = this.timestamps.get(key);
      if (timestamp && Date.now() < timestamp) {
        return this.cache.get(key);
      } else {
        // Expirado, remover
        this.delete(key);
      }
    }

    // Verificar no localStorage
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { value, timestamp } = JSON.parse(cached);
        if (Date.now() < timestamp) {
          // Ainda válido, carregar na memória
          this.cache.set(key, value);
          this.timestamps.set(key, timestamp);
          return value;
        } else {
          // Expirado, remover
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
    }

    return null;
  }

  // Verificar se existe e é válido
  has(key) {
    return this.get(key) !== null;
  }

  // Deletar item do cache
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  // Limpar todo o cache
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    
    // Limpar localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Limpar cache expirado
  cleanup() {
    const now = Date.now();
    
    // Limpar memória
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now >= timestamp) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }

    // Limpar localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (now >= cached.timestamp) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remover dados corrompidos
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Obter estatísticas do cache
  getStats() {
    return {
      memoryItems: this.cache.size,
      localStorageItems: Object.keys(localStorage).filter(k => k.startsWith('cache_')).length
    };
  }
}

// Instância global do cache
const cacheManager = new CacheManager();

// Limpar cache expirado a cada 5 minutos
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

// Cache específico para eventos do calendário
export class CalendarCache {
  static EVENTS_KEY = 'calendar_events';
  static CATEGORIES_KEY = 'calendar_categories';
  static SETTINGS_KEY = 'calendar_settings';

  // Cache de eventos por mês
  static getMonthEvents(year, month) {
    const key = `${this.EVENTS_KEY}_${year}_${month}`;
    return cacheManager.get(key);
  }

  static setMonthEvents(year, month, events) {
    const key = `${this.EVENTS_KEY}_${year}_${month}`;
    cacheManager.set(key, events, 10 * 60 * 1000); // 10 minutos
  }

  // Cache de categorias
  static getCategories() {
    return cacheManager.get(this.CATEGORIES_KEY);
  }

  static setCategories(categories) {
    cacheManager.set(this.CATEGORIES_KEY, categories, 30 * 60 * 1000); // 30 minutos
  }

  // Cache de configurações
  static getSettings() {
    return cacheManager.get(this.SETTINGS_KEY);
  }

  static setSettings(settings) {
    cacheManager.set(this.SETTINGS_KEY, settings, 60 * 60 * 1000); // 1 hora
  }

  // Invalidar cache de eventos
  static invalidateEvents() {
    const keys = Array.from(cacheManager.cache.keys());
    keys.forEach(key => {
      if (key.startsWith(this.EVENTS_KEY)) {
        cacheManager.delete(key);
      }
    });
  }

  // Invalidar cache de categorias
  static invalidateCategories() {
    cacheManager.delete(this.CATEGORIES_KEY);
  }
}

// Cache para dados da API
export class APICache {
  static STUDENTS_KEY = 'api_students';
  static BAPTISMS_KEY = 'api_baptisms';
  static COLLABORATORS_KEY = 'api_collaborators';

  // Cache genérico para endpoints da API
  static get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    return cacheManager.get(key);
  }

  static set(endpoint, params = {}, data, ttl = 5 * 60 * 1000) {
    const key = this.generateKey(endpoint, params);
    cacheManager.set(key, data, ttl);
  }

  static invalidate(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    cacheManager.delete(key);
  }

  static generateKey(endpoint, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `api_${endpoint}_${sortedParams}`;
  }

  // Invalidar por padrão
  static invalidatePattern(pattern) {
    const keys = Array.from(cacheManager.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cacheManager.delete(key);
      }
    });
  }
}

// Hook para uso do cache em componentes React
import { useState, useEffect, useCallback } from 'react';

export const useCache = (key, fetcher, dependencies = [], ttl) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar carregar do cache primeiro
      const cached = cacheManager.get(key);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Se não estiver em cache, buscar dados
      const result = await fetcher();
      cacheManager.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  const refresh = useCallback(() => {
    cacheManager.delete(key);
    loadData();
  }, [key, loadData]);

  const updateCache = useCallback((newData) => {
    cacheManager.set(key, newData, ttl);
    setData(newData);
  }, [key, ttl]);

  return {
    data,
    loading,
    error,
    refresh,
    updateCache
  };
};

export default cacheManager;
