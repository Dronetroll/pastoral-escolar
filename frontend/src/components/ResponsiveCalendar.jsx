import React, { useState, useEffect } from 'react';
import '../styles/calendar-responsive.css';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Grid,
  List,
  Search
} from 'lucide-react';

const ResponsiveCalendar = () => {
  // Estados principais
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day, agenda
  const [events, setEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState({});
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    categories: [],
    responsavel: '',
    search: '',
    dateRange: { start: '', end: '' }
  });

  // Carregamento inicial
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [currentDate, view]);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = async () => {
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const response = await fetch(
        `/api/eventos?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      const data = await response.json();
      
      const eventsMap = {};
      data.forEach(event => {
        const dateKey = new Date(event.dataInicio).toDateString();
        if (!eventsMap[dateKey]) eventsMap[dateKey] = [];
        eventsMap[dateKey].push(event);
      });
      
      setEvents(eventsMap);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/eventos/categorias');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const applyFilters = () => {
    let filtered = { ...events };

    // Filtro por categoria
    if (filters.categories.length > 0) {
      Object.keys(filtered).forEach(date => {
        filtered[date] = filtered[date].filter(event =>
          filters.categories.includes(event.categoria)
        );
        if (filtered[date].length === 0) delete filtered[date];
      });
    }

    // Filtro por responsável
    if (filters.responsavel) {
      Object.keys(filtered).forEach(date => {
        filtered[date] = filtered[date].filter(event =>
          event.responsavel.toLowerCase().includes(filters.responsavel.toLowerCase())
        );
        if (filtered[date].length === 0) delete filtered[date];
      });
    }

    // Filtro por busca
    if (filters.search) {
      Object.keys(filtered).forEach(date => {
        filtered[date] = filtered[date].filter(event =>
          event.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.descricao?.toLowerCase().includes(filters.search.toLowerCase())
        );
        if (filtered[date].length === 0) delete filtered[date];
      });
    }

    setFilteredEvents(filtered);
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    if (view === 'month') {
      date.setDate(1);
      date.setDate(date.getDate() - date.getDay());
    } else if (view === 'week') {
      date.setDate(date.getDate() - date.getDay());
    }
    return date;
  };

  const getViewEndDate = () => {
    const start = getViewStartDate();
    const end = new Date(start);
    if (view === 'month') {
      end.setDate(end.getDate() + 41);
    } else if (view === 'week') {
      end.setDate(end.getDate() + 6);
    } else {
      end.setDate(end.getDate() + 1);
    }
    return end;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDatePointer = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDatePointer));
      currentDatePointer.setDate(currentDatePointer.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ALTA': return 'bg-red-500';
      case 'MEDIA': return 'bg-yellow-500';
      case 'BAIXA': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'REUNIAO': 'bg-blue-100 text-blue-800',
      'CULTO': 'bg-purple-100 text-purple-800',
      'EVENTO_ESPECIAL': 'bg-green-100 text-green-800',
      'TREINAMENTO': 'bg-orange-100 text-orange-800',
      'COMUNITARIO': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Componente Header Responsivo
  const ResponsiveHeader = () => (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {view === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            {view === 'week' && `Semana de ${formatDate(getWeekDays()[0])}`}
            {view === 'day' && formatDate(currentDate)}
          </h2>
          
          <button
            onClick={() => navigateDate(1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* View Toggle - Hidden on small screens */}
        <div className="hidden md:flex items-center space-x-2">
          {['month', 'week', 'day', 'agenda'].map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                view === viewType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {viewType === 'month' && 'Mês'}
              {viewType === 'week' && 'Semana'}
              {viewType === 'day' && 'Dia'}
              {viewType === 'agenda' && 'Lista'}
            </button>
          ))}
        </div>

        {/* Add Event Button */}
        <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 p-4 bg-gray-50 rounded-lg">
          {/* Mobile View Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visualização
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['month', 'week', 'day', 'agenda'].map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => {
                    setView(viewType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    view === viewType
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {viewType === 'month' && 'Mês'}
                  {viewType === 'week' && 'Semana'}
                  {viewType === 'day' && 'Dia'}
                  {viewType === 'agenda' && 'Lista'}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar eventos
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável
              </label>
              <input
                type="text"
                placeholder="Nome do responsável..."
                value={filters.responsavel}
                onChange={(e) => setFilters(prev => ({ ...prev, responsavel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Componente Month View Responsivo
  const MonthView = () => {
    const days = getDaysInMonth();
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-50">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateKey = day.toDateString();
            const dayEvents = filteredEvents[dateKey] || [];
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-gray-200 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  !isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getCategoryColor(event.categoria)}`}
                      title={`${event.titulo} - ${formatTime(event.dataInicio)}`}
                    >
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.prioridade)}`} />
                        <span className="truncate">{event.titulo}</span>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Componente Week View Responsivo
  const WeekView = () => {
    const days = getWeekDays();
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50">
              Horário
            </div>
            {days.map((day, index) => (
              <div key={index} className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50">
                <div>{weekDays[index]}</div>
                <div className="text-lg">{day.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-2 text-xs text-gray-500 bg-gray-50">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
              {days.map((day, dayIndex) => {
                const dateKey = day.toDateString();
                const dayEvents = (filteredEvents[dateKey] || []).filter(event => {
                  const eventHour = new Date(event.dataInicio).getHours();
                  return eventHour === hour;
                });

                return (
                  <div key={dayIndex} className="p-1 min-h-[40px] border-r border-gray-100">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 ${getCategoryColor(event.categoria)}`}
                        title={event.titulo}
                      >
                        <div className="flex items-center space-x-1">
                          <div className={`w-1 h-1 rounded-full ${getPriorityColor(event.prioridade)}`} />
                          <span className="truncate">{event.titulo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente Day View Responsivo
  const DayView = () => {
    const dateKey = currentDate.toDateString();
    const dayEvents = filteredEvents[dateKey] || [];

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <p className="text-sm text-gray-500">{dayEvents.length} evento(s)</p>
        </div>

        <div className="divide-y divide-gray-200">
          {Array.from({ length: 24 }, (_, hour) => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = new Date(event.dataInicio).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex">
                <div className="w-16 sm:w-20 p-2 text-xs text-gray-500 bg-gray-50">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg mb-2 border-l-4 ${getCategoryColor(event.categoria)}`}
                      style={{ borderLeftColor: getPriorityColor(event.prioridade).replace('bg-', '#') }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{event.titulo}</h4>
                          <p className="text-sm text-gray-600 mt-1">{event.descricao}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              {formatTime(event.dataInicio)} - {formatTime(event.dataFim)}
                            </div>
                            {event.local && (
                              <div className="flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {event.local}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Users size={12} className="mr-1" />
                              {event.responsavel}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Componente Agenda View Responsivo
  const AgendaView = () => {
    const allEvents = Object.entries(filteredEvents)
      .flatMap(([date, events]) => 
        events.map(event => ({ ...event, date: new Date(date) }))
      )
      .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lista de Eventos</h3>
          <p className="text-sm text-gray-500">{allEvents.length} evento(s)</p>
        </div>

        <div className="divide-y divide-gray-200">
          {allEvents.map((event) => (
            <div key={event.id} className="p-4 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.prioridade)}`} />
                    <h4 className="font-medium text-gray-900">{event.titulo}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(event.categoria)}`}>
                      {event.categoria}
                    </span>
                  </div>
                  
                  {event.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{event.descricao}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {formatTime(event.dataInicio)} - {formatTime(event.dataFim)}
                    </div>
                    {event.local && (
                      <div className="flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {event.local}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users size={12} className="mr-1" />
                      {event.responsavel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {allEvents.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum evento encontrado</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Filtros Desktop - Hidden on mobile */}
        <div className="hidden lg:block mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar eventos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorias
                </label>
                <select
                  multiple
                  value={filters.categories}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, categories: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  placeholder="Nome do responsável..."
                  value={filters.responsavel}
                  onChange={(e) => setFilters(prev => ({ ...prev, responsavel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    categories: [],
                    responsavel: '',
                    search: '',
                    dateRange: { start: '', end: '' }
                  })}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do calendário */}
        <div className="calendar-content">
          {view === 'month' && <MonthView />}
          {view === 'week' && <WeekView />}
          {view === 'day' && <DayView />}
          {view === 'agenda' && <AgendaView />}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveCalendar;
