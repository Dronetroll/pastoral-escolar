import React, { useState, useEffect, useRef, createContext, useContext, useMemo, lazy, Suspense } from 'react';
import '../styles/cronograma-advanced.css';
import { useCronogramaData, useEventFilters } from '../hooks/useCronogramaData';
import EventFormModal from '../components/EventFormModal';
import CronogramaAnalytics from '../components/CronogramaAnalytics';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  Bell,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  MoreVertical,
  RefreshCw,
  Settings,
  Bookmark,
  Tag,
  FileText,
  Camera,
  Mic,
  Video,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

// Context para gerenciamento de estado global
const CronogramaContext = createContext();

// Hook personalizado para usar o contexto
const useCronograma = () => {
  const context = useContext(CronogramaContext);
  if (!context) {
    throw new Error('useCronograma deve ser usado dentro de CronogramaProvider');
  }
  return context;
};

// Provider do contexto
const CronogramaProvider = ({ children }) => {
  const {
    entries,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    exportEvents,
    getStatistics,
    refresh
  } = useCronogramaData();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [view, setView] = useState('day'); // day, week, month, agenda, analytics
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([
    'Reunião', 'Culto', 'Evento Especial', 'Treinamento', 'Comunitário', 'Administrativo'
  ]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { filters, setFilters, filteredEvents, clearFilters } = useEventFilters(entries);

  // Detectar mudanças de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = {
    entries: filteredEvents,
    allEntries: entries,
    selectedDate, setSelectedDate,
    view, setView,
    filters, setFilters, clearFilters,
    isLoading, error,
    isMobile, isTablet,
    notifications, setNotifications,
    categories, setCategories,
    showEventForm, setShowEventForm,
    editingEvent, setEditingEvent,
    addEvent, updateEvent, deleteEvent,
    exportEvents, getStatistics, refresh
  };

  return (
    <CronogramaContext.Provider value={value}>
      {children}
    </CronogramaContext.Provider>
  );
};

// Componente de Loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  </div>
);

// Componente de Empty State
const EmptyState = ({ message, action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <Calendar className="w-16 h-16 text-gray-300 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    {action && action}
  </div>
);

// Componente de Notificação Toast
const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${getBgColor()}`}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-500">{notification.message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Sistema de Notificações
const NotificationSystem = () => {
  const { notifications, setNotifications } = useCronograma();

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

// Hook para adicionar notificações
const useNotification = () => {
  const { setNotifications } = useCronograma();

  const addNotification = (type, title, message) => {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
  };

  return { addNotification };
};

// Componente do Header Responsivo
const ResponsiveHeader = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    view, 
    setView, 
    isMobile, 
    isTablet,
    filters,
    setFilters,
    clearFilters,
    exportEvents,
    refresh,
    isLoading
  } = useCronograma();
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { addNotification } = useNotification();

  const navigateDate = (direction) => {
    const date = new Date(selectedDate);
    if (view === 'day') {
      date.setDate(date.getDate() + direction);
    } else if (view === 'week') {
      date.setDate(date.getDate() + (direction * 7));
    } else if (view === 'month') {
      date.setMonth(date.getMonth() + direction);
    }
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  const formatHeaderDate = () => {
    const date = new Date(selectedDate);
    if (view === 'day') {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (view === 'week') {
      return `Semana de ${date.toLocaleDateString('pt-BR')}`;
    } else if (view === 'month') {
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    } else if (view === 'analytics') {
      return 'Relatórios e Estatísticas';
    }
    return 'Agenda';
  };

  const handleExport = (format) => {
    exportEvents(format);
    addNotification('success', 'Exportação', `Dados exportados em formato ${format.toUpperCase()}`);
  };

  const handleRefresh = () => {
    refresh();
    addNotification('info', 'Atualização', 'Dados atualizados com sucesso');
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Título */}
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cronograma Pastoral</h1>
              {!isMobile && (
                <p className="text-sm text-gray-500">Sistema avançado de gerenciamento de eventos</p>
              )}
            </div>
          </div>

          {/* Controles de navegação */}
          {view !== 'analytics' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {formatHeaderDate()}
                </h2>
              </div>
              
              <button
                onClick={() => navigateDate(1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {view === 'analytics' && (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatHeaderDate()}
              </h2>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <div className="relative group">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Menu mobile */}
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            )}

            {/* Views - Desktop */}
            {!isMobile && (
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'day', label: 'Dia', icon: Calendar },
                  { key: 'week', label: 'Semana', icon: Grid },
                  { key: 'month', label: 'Mês', icon: Grid },
                  { key: 'agenda', label: 'Lista', icon: List },
                  { key: 'analytics', label: 'Analytics', icon: BarChart3 }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      view === key
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobile && showMobileMenu && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { key: 'day', label: 'Dia', icon: Calendar },
                { key: 'week', label: 'Semana', icon: Grid },
                { key: 'month', label: 'Mês', icon: Grid },
                { key: 'agenda', label: 'Lista', icon: List },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setView(key);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                    view === key
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {view !== 'analytics' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            )}
          </div>
        )}

        {/* Painel de Filtros */}
        {showFilters && view !== 'analytics' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todas</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Culto">Culto</option>
                  <option value="Evento Especial">Evento Especial</option>
                  <option value="Treinamento">Treinamento</option>
                  <option value="Comunitário">Comunitário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  placeholder="Nome do responsável"
                  value={filters.responsavel}
                  onChange={(e) => setFilters(prev => ({ ...prev, responsavel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Evento Card
const EventCard = React.memo(({ event, onEdit, onDelete, onView, isCompact = false }) => {
  const [showActions, setShowActions] = useState(false);
  const { isMobile } = useCronograma();

  const getCategoryColor = (category) => {
    const colors = {
      'Reunião': 'bg-blue-100 text-blue-800 border-blue-200',
      'Culto': 'bg-purple-100 text-purple-800 border-purple-200',
      'Evento Especial': 'bg-green-100 text-green-800 border-green-200',
      'Treinamento': 'bg-orange-100 text-orange-800 border-orange-200',
      'Comunitário': 'bg-pink-100 text-pink-800 border-pink-200',
      'Administrativo': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'Alta': return 'border-l-4 border-red-500';
      case 'Média': return 'border-l-4 border-yellow-500';
      case 'Baixa': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  return (
    <div 
      className={`
        relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 
        ${getPriorityIndicator(event.priority)}
        ${isCompact ? 'p-2' : 'p-4'}
      `}
    >
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-900 truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
            {event.description || event.title}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
              {event.category || 'Geral'}
            </span>
            {event.priority && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                event.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                event.priority === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {event.priority}
              </span>
            )}
          </div>
        </div>

        {/* Menu de Ações */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="py-1">
                <button
                  onClick={() => { onView(event); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4" />
                  <span>Visualizar</span>
                </button>
                <button
                  onClick={() => { onEdit(event); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(JSON.stringify(event)); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => { onDelete(event); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informações do Evento */}
      <div className="space-y-2">
        {/* Horário */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{event.startTime} - {event.endTime}</span>
        </div>

        {/* Local */}
        {event.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Responsável */}
        {event.responsavel && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{event.responsavel}</span>
          </div>
        )}

        {/* Participantes */}
        {event.participants && event.participants.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{event.participants.length} participante(s)</span>
          </div>
        )}

        {/* Anexos */}
        {event.attachments && event.attachments.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{event.attachments.length} anexo(s)</span>
          </div>
        )}
      </div>

      {/* Footer do Card */}
      {!isCompact && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {event.isRecurring && (
              <span className="flex items-center space-x-1">
                <RefreshCw className="w-3 h-3" />
                <span>Recorrente</span>
              </span>
            )}
            {event.hasReminder && (
              <span className="flex items-center space-x-1">
                <Bell className="w-3 h-3" />
                <span>Lembrete</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {event.status === 'completed' && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {event.status === 'cancelled' && (
              <X className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// Componente Timeline para Vista Diária
const DayTimeline = () => {
  const { entries, selectedDate, filters } = useCronograma();
  const timelineRef = useRef(null);
  
  // Configurações da timeline
  const startHour = 6;
  const endHour = 23;
  const pxPerMinute = 1.5;
  const hourHeight = 60 * pxPerMinute;

  // Filtrar eventos do dia
  const dayEvents = useMemo(() => {
    return entries.filter(event => {
      const eventDate = event.date || new Date(event.dataInicio).toISOString().slice(0, 10);
      if (eventDate !== selectedDate) return false;

      // Aplicar filtros
      if (filters.search && !event.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category && event.category !== filters.category) return false;
      if (filters.responsavel && !event.responsavel?.toLowerCase().includes(filters.responsavel.toLowerCase())) return false;

      return true;
    });
  }, [entries, selectedDate, filters]);

  // Posição atual
  const now = new Date();
  const isToday = selectedDate === now.toISOString().slice(0, 10);
  const currentPosition = isToday ? ((now.getHours() - startHour) * 60 + now.getMinutes()) * pxPerMinute : null;

  // Auto-scroll para horário atual
  useEffect(() => {
    if (isToday && timelineRef.current && currentPosition) {
      const scrollPosition = Math.max(currentPosition - 200, 0);
      timelineRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
  }, [isToday, currentPosition]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div 
        ref={timelineRef}
        className="relative overflow-y-auto"
        style={{ height: '600px' }}
      >
        {/* Grid de horas */}
        <div style={{ height: (endHour - startHour + 1) * hourHeight }}>
          {Array.from({ length: endHour - startHour + 1 }, (_, i) => {
            const hour = startHour + i;
            const top = i * hourHeight;
            
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ top }}
              >
                <div className="flex">
                  <div className="w-20 p-2 text-sm text-gray-500 bg-gray-50 border-r">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 relative">
                    {/* Linha atual */}
                    {isToday && currentPosition && Math.abs(currentPosition - top) < hourHeight && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                        style={{ top: currentPosition - top }}
                      >
                        <div className="absolute -left-2 -top-1 w-4 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Eventos */}
          {dayEvents.map(event => {
            const startTime = event.startTime?.split(':') || ['08', '00'];
            const endTime = event.endTime?.split(':') || ['09', '00'];
            
            const startMinutes = (parseInt(startTime[0]) - startHour) * 60 + parseInt(startTime[1]);
            const endMinutes = (parseInt(endTime[0]) - startHour) * 60 + parseInt(endTime[1]);
            
            const top = startMinutes * pxPerMinute;
            const height = Math.max((endMinutes - startMinutes) * pxPerMinute, 30);
            
            if (top < 0) return null;

            return (
              <div
                key={event.id}
                className="absolute left-20 right-4 bg-emerald-50 border border-emerald-200 rounded-lg p-2 z-10 cursor-pointer hover:shadow-md transition-shadow"
                style={{ top, height }}
              >
                <div className="h-full flex flex-col justify-center">
                  <h4 className="font-medium text-emerald-900 text-sm truncate">
                    {event.description || event.title}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    {event.startTime} - {event.endTime}
                  </p>
                  {event.location && (
                    <p className="text-xs text-emerald-600 truncate">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Componente Vista em Lista (Agenda)
const AgendaView = ({ onEdit, onDelete, onView }) => {
  const { entries, filters, isMobile } = useCronograma();

  // Filtrar e ordenar eventos
  const filteredEvents = useMemo(() => {
    let filtered = [...entries];

    // Ordenar por data e hora
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.dataInicio);
      const dateB = new Date(b.date || b.dataInicio);
      return dateA - dateB;
    });
  }, [entries]);

  if (filteredEvents.length === 0) {
    return (
      <EmptyState 
        message="Nenhum evento encontrado para os filtros aplicados"
        action={
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Adicionar Primeiro Evento
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Todos os Eventos ({filteredEvents.length})
        </h3>
        
        <div className="space-y-3">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              isCompact={isMobile}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente Principal
const CronogramaAdvanced = () => {
  const { 
    view, 
    isLoading, 
    showEventForm, 
    setShowEventForm,
    editingEvent,
    setEditingEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    categories,
    allEntries
  } = useCronograma();
  const { addNotification } = useNotification();

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        addNotification('success', 'Evento Atualizado', 'O evento foi atualizado com sucesso');
      } else {
        await addEvent(eventData);
        addNotification('success', 'Evento Criado', 'O evento foi criado com sucesso');
      }
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (error) {
      addNotification('error', 'Erro', error.message || 'Erro ao salvar evento');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await deleteEvent(event.id);
        addNotification('success', 'Evento Excluído', 'O evento foi removido com sucesso');
      } catch (error) {
        addNotification('error', 'Erro', error.message || 'Erro ao excluir evento');
      }
    }
  };

  const handleViewEvent = (event) => {
    addNotification('info', 'Visualizar Evento', `Abrindo detalhes de: ${event.description || event.title}`);
    // Aqui você pode implementar um modal de visualização
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderView = () => {
    switch (view) {
      case 'day':
        return <DayTimeline />;
      case 'week':
        return <div className="p-8 text-center text-gray-500">Vista semanal em desenvolvimento</div>;
      case 'month':
        return <div className="p-8 text-center text-gray-500">Vista mensal em desenvolvimento</div>;
      case 'agenda':
        return (
          <AgendaView 
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onView={handleViewEvent}
          />
        );
      case 'analytics':
        return <CronogramaAnalytics events={allEntries} />;
      default:
        return <DayTimeline />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader />
      <NotificationSystem />
      
      <div className="max-w-7xl mx-auto p-4">
        {renderView()}
      </div>

      {/* FAB para adicionar evento */}
      <button 
        onClick={() => {
          setEditingEvent(null);
          setShowEventForm(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors z-50 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal do formulário */}
      <EventFormModal
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        categories={categories}
        isLoading={isLoading}
      />
    </div>
  );
};

// Componente principal com Provider
const CronogramaAdvancedWithProvider = () => {
  return (
    <CronogramaProvider>
      <CronogramaAdvanced />
    </CronogramaProvider>
  );
};

export default CronogramaAdvancedWithProvider;
