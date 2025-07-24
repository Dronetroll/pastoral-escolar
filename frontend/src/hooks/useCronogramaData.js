import { useState, useEffect, useCallback } from 'react';

// Hook personalizado para gerenciamento de dados do cronograma
export const useCronogramaData = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar eventos do backend
  const loadEvents = useCallback(async (dateRange = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = 'http://localhost:3005/api/eventos';
      if (dateRange) {
        url += `?start=${dateRange.start}&end=${dateRange.end}`;
      }
      
      const response = await fetch(url, { mode: 'cors' });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const events = await response.json();
      
      // Mapear eventos do backend para o formato interno
      const mappedEvents = events.map(ev => ({
        id: ev.id,
        title: ev.titulo,
        description: ev.descricao || ev.titulo,
        date: new Date(ev.dataInicio).toISOString().slice(0, 10),
        startTime: new Date(ev.dataInicio).toTimeString().slice(0, 5),
        endTime: new Date(ev.dataFim).toTimeString().slice(0, 5),
        category: ev.categoria || 'Geral',
        priority: ev.prioridade || 'Média',
        responsavel: ev.responsavel,
        location: ev.local,
        participants: ev.participantes || [],
        attachments: ev.anexos || [],
        isRecurring: !!ev.recorrencia,
        hasReminder: !!ev.lembrete,
        status: ev.status || 'scheduled',
        recurrenceDays: ev.recorrencia ? ev.recorrencia.split(',') : [],
        source: 'backend'
      }));
      
      setEntries(mappedEvents);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError(err.message);
      
      // Tentar carregar dados do localStorage como fallback
      loadLocalEvents();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar eventos do localStorage
  const loadLocalEvents = useCallback(() => {
    try {
      const savedEvents = JSON.parse(localStorage.getItem('cronogramaEvents') || '{}');
      const localEntries = [];
      
      Object.entries(savedEvents).forEach(([date, dayEvents]) => {
        dayEvents.forEach((event, index) => {
          localEntries.push({
            id: `local-${date}-${index}`,
            title: event.title,
            description: event.title,
            date: event.date || date,
            startTime: event.time || event.startTime || '08:00',
            endTime: event.endTime || '09:00',
            category: event.category || 'Geral',
            priority: event.priority || 'Média',
            responsavel: event.responsavel || '',
            location: event.location || '',
            participants: event.participants || [],
            attachments: event.attachments || [],
            isRecurring: event.recurrenceDays && event.recurrenceDays.length > 0,
            hasReminder: event.hasReminder || false,
            status: event.status || 'scheduled',
            recurrenceDays: event.recurrenceDays || [],
            source: 'local'
          });
        });
      });
      
      setEntries(localEntries);
    } catch (err) {
      console.error('Erro ao carregar eventos locais:', err);
      setEntries([]);
    }
  }, []);

  // Adicionar novo evento
  const addEvent = useCallback(async (eventData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Tentar salvar no backend primeiro
      const response = await fetch('http://localhost:3005/api/eventos/cronograma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: eventData.title || eventData.description,
          descricao: eventData.description,
          dataInicio: `${eventData.date}T${eventData.startTime}:00`,
          dataFim: `${eventData.date}T${eventData.endTime}:00`,
          categoria: eventData.category,
          prioridade: eventData.priority,
          responsavel: eventData.responsavel,
          local: eventData.location,
          recorrencia: eventData.recurrenceDays?.join(',') || '',
          lembrete: eventData.hasReminder
        })
      });
      
      if (response.ok) {
        const newEvent = await response.json();
        setEntries(prev => [...prev, {
          ...eventData,
          id: newEvent.id,
          source: 'backend'
        }]);
      } else {
        throw new Error('Falha ao salvar no backend');
      }
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      
      // Salvar localmente como fallback
      saveEventLocally(eventData);
      
      const localEvent = {
        ...eventData,
        id: `local-${Date.now()}`,
        source: 'local'
      };
      
      setEntries(prev => [...prev, localEvent]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar evento localmente
  const saveEventLocally = useCallback((eventData) => {
    try {
      const saved = JSON.parse(localStorage.getItem('cronogramaEvents') || '{}');
      if (!saved[eventData.date]) saved[eventData.date] = [];
      
      saved[eventData.date].push({
        title: eventData.title || eventData.description,
        description: eventData.description,
        date: eventData.date,
        time: eventData.startTime,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        category: eventData.category,
        priority: eventData.priority,
        responsavel: eventData.responsavel,
        location: eventData.location,
        participants: eventData.participants,
        attachments: eventData.attachments,
        recurrenceDays: eventData.recurrenceDays,
        hasReminder: eventData.hasReminder,
        status: eventData.status
      });
      
      localStorage.setItem('cronogramaEvents', JSON.stringify(saved));
    } catch (err) {
      console.error('Erro ao salvar localmente:', err);
    }
  }, []);

  // Atualizar evento
  const updateEvent = useCallback(async (eventId, eventData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (eventId.startsWith('local-')) {
        // Atualizar evento local
        setEntries(prev => prev.map(event => 
          event.id === eventId ? { ...event, ...eventData } : event
        ));
        
        // Atualizar localStorage
        updateLocalEvent(eventId, eventData);
      } else {
        // Atualizar no backend
        const response = await fetch(`http://localhost:3005/api/eventos/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: eventData.title || eventData.description,
            descricao: eventData.description,
            dataInicio: `${eventData.date}T${eventData.startTime}:00`,
            dataFim: `${eventData.date}T${eventData.endTime}:00`,
            categoria: eventData.category,
            prioridade: eventData.priority,
            responsavel: eventData.responsavel,
            local: eventData.location,
            recorrencia: eventData.recurrenceDays?.join(',') || '',
            lembrete: eventData.hasReminder
          })
        });
        
        if (response.ok) {
          setEntries(prev => prev.map(event => 
            event.id === eventId ? { ...event, ...eventData } : event
          ));
        } else {
          throw new Error('Falha ao atualizar no backend');
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar evento local
  const updateLocalEvent = useCallback((eventId, eventData) => {
    try {
      const saved = JSON.parse(localStorage.getItem('cronogramaEvents') || '{}');
      
      // Encontrar e atualizar o evento
      Object.keys(saved).forEach(date => {
        saved[date] = saved[date].map((event, index) => {
          if (`local-${date}-${index}` === eventId) {
            return {
              ...event,
              ...eventData,
              title: eventData.title || eventData.description,
              time: eventData.startTime
            };
          }
          return event;
        });
      });
      
      localStorage.setItem('cronogramaEvents', JSON.stringify(saved));
    } catch (err) {
      console.error('Erro ao atualizar evento local:', err);
    }
  }, []);

  // Deletar evento
  const deleteEvent = useCallback(async (eventId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (eventId.startsWith('local-')) {
        // Deletar evento local
        setEntries(prev => prev.filter(event => event.id !== eventId));
        deleteLocalEvent(eventId);
      } else {
        // Deletar do backend
        const response = await fetch(`http://localhost:3005/api/eventos/${eventId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setEntries(prev => prev.filter(event => event.id !== eventId));
        } else {
          throw new Error('Falha ao deletar do backend');
        }
      }
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deletar evento local
  const deleteLocalEvent = useCallback((eventId) => {
    try {
      const saved = JSON.parse(localStorage.getItem('cronogramaEvents') || '{}');
      
      Object.keys(saved).forEach(date => {
        saved[date] = saved[date].filter((_, index) => 
          `local-${date}-${index}` !== eventId
        );
        if (saved[date].length === 0) {
          delete saved[date];
        }
      });
      
      localStorage.setItem('cronogramaEvents', JSON.stringify(saved));
    } catch (err) {
      console.error('Erro ao deletar evento local:', err);
    }
  }, []);

  // Exportar eventos
  const exportEvents = useCallback((format = 'json', dateRange = null) => {
    let eventsToExport = entries;
    
    if (dateRange) {
      eventsToExport = entries.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date(dateRange.start) && eventDate <= new Date(dateRange.end);
      });
    }
    
    if (format === 'json') {
      const dataStr = JSON.stringify(eventsToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cronograma-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csv = [
        ['Data', 'Início', 'Fim', 'Título', 'Categoria', 'Responsável', 'Local'].join(','),
        ...eventsToExport.map(event => [
          event.date,
          event.startTime,
          event.endTime,
          `"${event.description}"`,
          event.category,
          `"${event.responsavel || ''}"`,
          `"${event.location || ''}"`
        ].join(','))
      ].join('\n');
      
      const dataBlob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cronograma-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  }, [entries]);

  // Estatísticas
  const getStatistics = useCallback(() => {
    const total = entries.length;
    const byCategory = entries.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});
    
    const byStatus = entries.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});
    
    const upcoming = entries.filter(event => {
      const eventDateTime = new Date(`${event.date}T${event.startTime}`);
      return eventDateTime > new Date();
    }).length;
    
    return {
      total,
      upcoming,
      byCategory,
      byStatus
    };
  }, [entries]);

  // Carregar eventos na inicialização
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    entries,
    isLoading,
    error,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    exportEvents,
    getStatistics,
    refresh: loadEvents
  };
};

// Hook para filtros avançados
export const useEventFilters = (events) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    responsavel: '',
    status: '',
    dateRange: { start: '', end: '' },
    priority: ''
  });

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          event.description?.toLowerCase().includes(searchLower) ||
          event.title?.toLowerCase().includes(searchLower) ||
          event.responsavel?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro de categoria
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Filtro de responsável
      if (filters.responsavel) {
        const responsavelLower = filters.responsavel.toLowerCase();
        if (!event.responsavel?.toLowerCase().includes(responsavelLower)) {
          return false;
        }
      }

      // Filtro de status
      if (filters.status && event.status !== filters.status) {
        return false;
      }

      // Filtro de prioridade
      if (filters.priority && event.priority !== filters.priority) {
        return false;
      }

      // Filtro de intervalo de datas
      if (filters.dateRange.start || filters.dateRange.end) {
        const eventDate = new Date(event.date);
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (eventDate < startDate) return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          if (eventDate > endDate) return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  return {
    filters,
    setFilters,
    filteredEvents,
    clearFilters: () => setFilters({
      search: '',
      category: '',
      responsavel: '',
      status: '',
      dateRange: { start: '', end: '' },
      priority: ''
    })
  };
};

export default useCronogramaData;
