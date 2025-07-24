import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  Users,
  Clock,
  MapPin,
  Tag,
  Bell,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Settings,
  BarChart3,
  Menu,
  X,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

// Componente principal do calendário responsivo
const ResponsiveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day, agenda
  const [events, setEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState({});
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    responsavel: '',
    search: '',
    dateRange: { start: '', end: '' }
  });
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estados para criação/edição de eventos
  const [eventForm, setEventForm] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    dataInicio: '',
    horaInicio: '',
    dataFim: '',
    horaFim: '',
    local: '',
    responsavel: '',
    publicoAlvo: '',
    estimativaParticipantes: '',
    cor: '#3B82F6',
    prioridade: 'MEDIA',
    recorrencia: {
      tipo: 'NENHUMA',
      intervalo: 1,
      dataFim: '',
      diasSemana: []
    },
    notificacoes: {
      antes: [15], // 15 minutos antes
      participantes: false,
      responsavel: true
    },
    recursos: {
      necessario: false,
      equipamentos: [],
      materiais: [],
      pessoal: [],
      orcamento: 0
    }
  });

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Em mobile, preferir view de agenda
      if (window.innerWidth < 768 && view === 'month') {
        setView('agenda');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [view]);

  // Cores predefinidas para categorias
  const categoryColors = {
    'Culto': '#8B5CF6',
    'Reunião': '#3B82F6',
    'Evento Especial': '#F59E0B',
    'Treinamento': '#10B981',
    'Batismo': '#06B6D4',
    'Classe Bíblica': '#EC4899',
    'Escola Saudável': '#84CC16',
    'Atividade Pastoral': '#F97316',
    'Administrativo': '#6B7280'
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadEvents();
    loadCategories();
    loadStatistics();
  }, [currentDate, filters]);

  // Carregar eventos da API
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...filters
      });

      const response = await fetch(`http://localhost:3001/api/eventos?${params}`);
      const data = await response.json();

      // Organizar eventos por data
      const eventsByDate = {};
      data.eventos?.forEach(evento => {
        const date = new Date(evento.dataInicio).toISOString().split('T')[0];
        if (!eventsByDate[date]) eventsByDate[date] = [];
        eventsByDate[date].push(evento);
      });

      setEvents(eventsByDate);
      setFilteredEvents(eventsByDate);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar categorias
  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/eventos/admin/categorias');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  // Carregar estatísticas
  const loadStatistics = async () => {
    try {
      const params = new URLSearchParams({
        mes: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      });

      const response = await fetch(`http://localhost:3001/api/eventos/admin/estatisticas?${params}`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Navegar datas
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Renderizar header responsivo
  const renderResponsiveHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      {/* Header Mobile */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('pt-BR', { 
              month: 'short', 
              year: 'numeric' 
            })}
          </h2>
          
          <button
            onClick={() => {
              setSelectedEvent(null);
              resetForm();
              setShowModal(true);
            }}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Mobile Expandido */}
        {showMobileMenu && (
          <div className="space-y-3 pb-3 border-t border-gray-200 pt-3">
            {/* Navegação de data mobile */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-base font-medium min-w-[120px] text-center">
                {currentDate.toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="w-full px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Ir para Hoje
            </button>

            {/* Views mobile */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'agenda', label: 'Lista', icon: List },
                { key: 'month', label: 'Mês', icon: Grid }
              ].map((viewOption) => (
                <button
                  key={viewOption.key}
                  onClick={() => {
                    setView(viewOption.key);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    view === viewOption.key 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <viewOption.icon className="w-4 h-4" />
                  {viewOption.label}
                </button>
              ))}
            </div>

            {/* Ações mobile */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>

              <button
                onClick={() => {
                  exportToICal();
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header Desktop */}
      <div className="hidden sm:block">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Navegação de data */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px]">
              {currentDate.toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Hoje
            </button>
          </div>

          {/* Controles e ações */}
          <div className="flex items-center gap-2">
            {/* Visualizações */}
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              {['month', 'agenda'].map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    view === viewType 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {viewType === 'month' ? 'Mês' : 'Lista'}
                </button>
              ))}
            </div>

            {/* Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Exportar */}
            <button
              onClick={exportToICal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Novo evento */}
            <button
              onClick={() => {
                setSelectedEvent(null);
                resetForm();
                setShowModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Evento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas responsivas */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary-600">{statistics.totalEventos}</div>
            <div className="text-xs sm:text-sm text-gray-600">Este mês</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{statistics.eventosProximos?.length || 0}</div>
            <div className="text-xs sm:text-sm text-gray-600">7 dias</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{statistics.participacaoTotal}</div>
            <div className="text-xs sm:text-sm text-gray-600">Participações</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{statistics.mediaParticipantesPorEvento}</div>
            <div className="text-xs sm:text-sm text-gray-600">Média/evento</div>
          </div>
        </div>
      )}
    </div>
  );

  // Criar/editar evento
  const handleSaveEvent = async () => {
    try {
      const eventData = {
        ...eventForm,
        dataInicio: `${eventForm.dataInicio}T${eventForm.horaInicio}:00`,
        dataFim: `${eventForm.dataFim}T${eventForm.horaFim}:00`,
        estimativaParticipantes: eventForm.estimativaParticipantes ? 
          parseInt(eventForm.estimativaParticipantes) : null
      };

      const method = selectedEvent ? 'PUT' : 'POST';
      const url = selectedEvent ? 
        `http://localhost:3001/api/eventos/${selectedEvent.id}` : 
        'http://localhost:3001/api/eventos';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        toast.success(selectedEvent ? 'Evento atualizado!' : 'Evento criado!');
        setShowModal(false);
        setSelectedEvent(null);
        resetForm();
        loadEvents();
      } else {
        toast.error('Erro ao salvar evento');
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error('Erro ao salvar evento');
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setEventForm({
      titulo: '',
      descricao: '',
      categoria: '',
      dataInicio: '',
      horaInicio: '',
      dataFim: '',
      horaFim: '',
      local: '',
      responsavel: '',
      publicoAlvo: '',
      estimativaParticipantes: '',
      cor: '#3B82F6',
      prioridade: 'MEDIA',
      recorrencia: {
        tipo: 'NENHUMA',
        intervalo: 1,
        dataFim: '',
        diasSemana: []
      },
      notificacoes: {
        antes: [15],
        participantes: false,
        responsavel: true
      },
      recursos: {
        necessario: false,
        equipamentos: [],
        materiais: [],
        pessoal: [],
        orcamento: 0
      }
    });
  };

  // Exportar calendário para iCal
  const exportToICal = () => {
    const allEvents = Object.values(filteredEvents).flat();
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:Sistema Pastoral Escolar\n';
    
    allEvents.forEach(event => {
      ical += 'BEGIN:VEVENT\n';
      ical += `UID:${event.id}@pastoral-escolar\n`;
      ical += `SUMMARY:${event.titulo}\n`;
      ical += `DESCRIPTION:${event.descricao || ''}\n`;
      ical += `DTSTART:${new Date(event.dataInicio).toISOString().replace(/[:-]/g, '').split('.')[0]}Z\n`;
      ical += `DTEND:${new Date(event.dataFim).toISOString().replace(/[:-]/g, '').split('.')[0]}Z\n`;
      if (event.local) ical += `LOCATION:${event.local}\n`;
      ical += 'END:VEVENT\n';
    });
    
    ical += 'END:VCALENDAR';
    
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendario-pastoral.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {renderResponsiveHeader()}
      
      {/* Filtros responsivos */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar eventos..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={filters.categories[0] || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  categories: e.target.value ? [e.target.value] : [] 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
              <input
                type="text"
                value={filters.responsavel}
                onChange={(e) => setFilters(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Conteúdo do calendário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        {view === 'agenda' ? (
          <AgendaView events={filteredEvents} onEventClick={setSelectedEvent} />
        ) : view === 'month' ? (
          <MonthView 
            currentDate={currentDate} 
            events={filteredEvents} 
            onEventClick={setSelectedEvent}
            onDateClick={(date) => {
              setEventForm(prev => ({ ...prev, dataInicio: date, dataFim: date }));
              setShowModal(true);
            }}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Vista em desenvolvimento</h3>
            <p>Esta visualização estará disponível em breve...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de visualização em agenda (lista)
const AgendaView = ({ events, onEventClick }) => {
  const allEvents = Object.entries(events)
    .flatMap(([date, dayEvents]) => 
      dayEvents.map(event => ({ ...event, date }))
    )
    .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
        <p>Não há eventos para o período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Eventos ({allEvents.length})
      </h3>
      
      {allEvents.map((event, index) => (
        <div
          key={`${event.id}-${index}`}
          onClick={() => onEventClick(event)}
          className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 sm:p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: event.cor || '#3B82F6' }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                <h4 className="font-medium text-gray-900 truncate">{event.titulo}</h4>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {new Date(event.dataInicio).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(event.dataInicio).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
              
              {event.descricao && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.descricao}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                {event.local && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{event.local}</span>
                  </div>
                )}
                
                {event.responsavel && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{event.responsavel}</span>
                  </div>
                )}
                
                {event.categoria && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{event.categoria}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente de visualização mensal
const MonthView = ({ currentDate, events, onEventClick, onDateClick }) => {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Calcular primeiro dia do calendário (incluindo dias da semana anterior)
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
  
  // Calcular último dia do calendário (incluindo dias da próxima semana)
  const endOfCalendar = new Date(endOfMonth);
  endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfCalendar.getDay()));
  
  const days = [];
  const current = new Date(startOfCalendar);
  
  while (current <= endOfCalendar) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const today = new Date().toISOString().split('T')[0];
  const isCurrentMonth = (date) => date.getMonth() === currentDate.getMonth();

  return (
    <div className="space-y-4">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center py-2 text-xs sm:text-sm font-medium text-gray-500">
            <span className="hidden sm:inline">{day === 'Dom' ? 'Domingo' : 
                                                  day === 'Seg' ? 'Segunda' :
                                                  day === 'Ter' ? 'Terça' :
                                                  day === 'Qua' ? 'Quarta' :
                                                  day === 'Qui' ? 'Quinta' :
                                                  day === 'Sex' ? 'Sexta' : 'Sábado'}</span>
            <span className="sm:hidden">{day}</span>
          </div>
        ))}
      </div>
      
      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day, index) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayEvents = events[dateStr] || [];
          const isToday = dateStr === today;
          const isThisMonth = isCurrentMonth(day);

          return (
            <div
              key={index}
              onClick={() => onDateClick(dateStr)}
              className={`
                min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-200 rounded-lg cursor-pointer
                transition-colors hover:bg-gray-50
                ${isToday ? 'bg-primary-50 border-primary-200' : ''}
                ${!isThisMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
              `}
            >
              <div className={`text-sm sm:text-base font-medium mb-1 ${
                isToday ? 'text-primary-600' : isThisMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, window.innerWidth < 640 ? 2 : 3).map((event, eventIndex) => (
                  <div
                    key={`${event.id}-${eventIndex}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="text-xs px-1 py-0.5 sm:px-2 sm:py-1 rounded text-white font-medium cursor-pointer hover:opacity-80 transition-opacity truncate"
                    style={{ backgroundColor: event.cor || '#3B82F6' }}
                    title={event.titulo}
                  >
                    <span className="block truncate">
                      {window.innerWidth < 640 ? 
                        event.titulo.substring(0, 10) + (event.titulo.length > 10 ? '...' : '') :
                        event.titulo
                      }
                    </span>
                  </div>
                ))}
                
                {dayEvents.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - (window.innerWidth < 640 ? 2 : 3)} mais
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

export default ResponsiveCalendar;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day, agenda
  const [events, setEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState({});
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    responsavel: '',
    search: '',
    dateRange: { start: '', end: '' }
  });
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Estados para criação/edição de eventos
  const [eventForm, setEventForm] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    dataInicio: '',
    horaInicio: '',
    dataFim: '',
    horaFim: '',
    local: '',
    responsavel: '',
    publicoAlvo: '',
    estimativaParticipantes: '',
    cor: '#3B82F6',
    prioridade: 'MEDIA',
    recorrencia: {
      tipo: 'NENHUMA',
      intervalo: 1,
      dataFim: '',
      diasSemana: []
    },
    notificacoes: {
      antes: [15], // 15 minutos antes
      participantes: false,
      responsavel: true
    },
    recursos: {
      necessario: false,
      equipamentos: [],
      materiais: [],
      pessoal: [],
      orcamento: 0
    }
  });

  // Cores predefinidas para categorias
  const categoryColors = {
    'Culto': '#8B5CF6',
    'Reunião': '#3B82F6',
    'Evento Especial': '#F59E0B',
    'Treinamento': '#10B981',
    'Batismo': '#06B6D4',
    'Classe Bíblica': '#EC4899',
    'Escola Saudável': '#84CC16',
    'Atividade Pastoral': '#F97316',
    'Administrativo': '#6B7280'
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadEvents();
    loadCategories();
    loadStatistics();
  }, [currentDate, filters]);

  // Carregar eventos da API
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...filters
      });

      const response = await fetch(`http://localhost:3001/api/eventos?${params}`);
      const data = await response.json();

      // Organizar eventos por data
      const eventsByDate = {};
      data.eventos.forEach(evento => {
        const date = new Date(evento.dataInicio).toISOString().split('T')[0];
        if (!eventsByDate[date]) eventsByDate[date] = [];
        eventsByDate[date].push(evento);
      });

      setEvents(eventsByDate);
      setFilteredEvents(eventsByDate);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar categorias
  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/eventos/admin/categorias');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  // Carregar estatísticas
  const loadStatistics = async () => {
    try {
      const params = new URLSearchParams({
        mes: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      });

      const response = await fetch(`http://localhost:3001/api/eventos/admin/estatisticas?${params}`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Criar/editar evento
  const handleSaveEvent = async () => {
    try {
      const eventData = {
        ...eventForm,
        dataInicio: `${eventForm.dataInicio}T${eventForm.horaInicio}:00`,
        dataFim: `${eventForm.dataFim}T${eventForm.horaFim}:00`,
        estimativaParticipantes: eventForm.estimativaParticipantes ? 
          parseInt(eventForm.estimativaParticipantes) : null
      };

      const method = selectedEvent ? 'PUT' : 'POST';
      const url = selectedEvent ? 
        `http://localhost:3001/api/eventos/${selectedEvent.id}` : 
        'http://localhost:3001/api/eventos';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        toast.success(selectedEvent ? 'Evento atualizado!' : 'Evento criado!');
        setShowModal(false);
        setSelectedEvent(null);
        resetForm();
        loadEvents();
      } else {
        toast.error('Erro ao salvar evento');
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error('Erro ao salvar evento');
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setEventForm({
      titulo: '',
      descricao: '',
      categoria: '',
      dataInicio: '',
      horaInicio: '',
      dataFim: '',
      horaFim: '',
      local: '',
      responsavel: '',
      publicoAlvo: '',
      estimativaParticipantes: '',
      cor: '#3B82F6',
      prioridade: 'MEDIA',
      recorrencia: {
        tipo: 'NENHUMA',
        intervalo: 1,
        dataFim: '',
        diasSemana: []
      },
      notificacoes: {
        antes: [15],
        participantes: false,
        responsavel: true
      },
      recursos: {
        necessario: false,
        equipamentos: [],
        materiais: [],
        pessoal: [],
        orcamento: 0
      }
    });
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = { ...events };

    // Filtrar por categoria
    if (filters.categories.length > 0) {
      Object.keys(filtered).forEach(date => {
        filtered[date] = filtered[date].filter(event => 
          filters.categories.includes(event.categoria)
        );
        if (filtered[date].length === 0) delete filtered[date];
      });
    }

    // Filtrar por responsável
    if (filters.responsavel) {
      Object.keys(filtered).forEach(date => {
        filtered[date] = filtered[date].filter(event => 
          event.responsavel?.toLowerCase().includes(filters.responsavel.toLowerCase())
        );
        if (filtered[date].length === 0) delete filtered[date];
      });
    }

    // Filtrar por busca
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

  // Exportar calendário para iCal
  const exportToICal = () => {
    const allEvents = Object.values(filteredEvents).flat();
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:Sistema Pastoral Escolar\n';
    
    allEvents.forEach(event => {
      ical += 'BEGIN:VEVENT\n';
      ical += `UID:${event.id}@pastoral-escolar\n`;
      ical += `SUMMARY:${event.titulo}\n`;
      ical += `DESCRIPTION:${event.descricao || ''}\n`;
      ical += `DTSTART:${new Date(event.dataInicio).toISOString().replace(/[:-]/g, '').split('.')[0]}Z\n`;
      ical += `DTEND:${new Date(event.dataFim).toISOString().replace(/[:-]/g, '').split('.')[0]}Z\n`;
      if (event.local) ical += `LOCATION:${event.local}\n`;
      ical += 'END:VEVENT\n';
    });
    
    ical += 'END:VCALENDAR';
    
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendario-pastoral.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Renderizar header do calendário
  const renderHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Navegação de data */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* Controles e ações */}
        <div className="flex items-center gap-2">
          {/* Visualizações */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day', 'agenda'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  view === viewType 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType === 'month' ? 'Mês' : 
                 viewType === 'week' ? 'Semana' : 
                 viewType === 'day' ? 'Dia' : 'Agenda'}
              </button>
            ))}
          </div>

          {/* Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Estatísticas */}
          <button
            onClick={() => {/* Abrir modal de estatísticas */}}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          {/* Exportar */}
          <button
            onClick={exportToICal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Novo evento */}
          <button
            onClick={() => {
              setSelectedEvent(null);
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      {statistics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{statistics.totalEventos}</div>
            <div className="text-sm text-gray-600">Eventos este mês</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.eventosProximos.length}</div>
            <div className="text-sm text-gray-600">Próximos 7 dias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.participacaoTotal}</div>
            <div className="text-sm text-gray-600">Participações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{statistics.mediaParticipantesPorEvento}</div>
            <div className="text-sm text-gray-600">Média/evento</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {renderResponsiveHeader()}
      
      {/* Filtros responsivos */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar eventos..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={filters.categories[0] || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  categories: e.target.value ? [e.target.value] : [] 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
              <input
                type="text"
                value={filters.responsavel}
                onChange={(e) => setFilters(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Conteúdo do calendário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        {view === 'agenda' ? (
          <AgendaView events={filteredEvents} onEventClick={setSelectedEvent} />
        ) : view === 'month' ? (
          <MonthView 
            currentDate={currentDate} 
            events={filteredEvents} 
            onEventClick={setSelectedEvent}
            onDateClick={(date) => {
              setEventForm(prev => ({ ...prev, dataInicio: date, dataFim: date }));
              setShowModal(true);
            }}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Vista em desenvolvimento</h3>
            <p>Esta visualização estará disponível em breve...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveCalendar;
