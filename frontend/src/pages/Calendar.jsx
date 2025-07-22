import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  X,
  Clock,
  Download,
  Upload
} from 'lucide-react';
import '../styles/calendar.css';

const Calendar = () => {

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [events, setEvents] = React.useState({});
  const [showEventForm, setShowEventForm] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [toast, setToast] = React.useState(null);
  const [eventForm, setEventForm] = React.useState({
    title: '',
    date: '',
    color: '#ef4444',
    description: '',
    time: '',
    location: ''
  });

  // Eventos futuros do mês, ordenados
  const futureMonthEvents = React.useMemo(() => {
    const now = new Date();
    let futureEvents = [];
    Object.entries(events)
      .filter(([dateStr]) => {
        const eventDate = new Date(dateStr);
        return eventDate.getMonth() === currentDate.getMonth() && 
               eventDate.getFullYear() === currentDate.getFullYear();
      })
      .forEach(([dateStr, dayEvents]) => {
        dayEvents.forEach((event, eventIndex) => {
          let eventDateTime = new Date(dateStr);
          if (event.time) {
            const [h, m] = event.time.split(":");
            eventDateTime.setHours(Number(h), Number(m), 0, 0);
          } else {
            eventDateTime.setHours(0, 0, 0, 0);
          }
          if (eventDateTime >= now) {
            futureEvents.push({ event, dateStr, eventIndex, eventDateTime });
          }
        });
      });
    futureEvents.sort((a, b) => a.eventDateTime - b.eventDateTime);
    return futureEvents;
  }, [events, currentDate]);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [exportRange, setExportRange] = React.useState('mes');

  // Função para mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const colors = [
    { value: '#ef4444', name: 'Vermelho' },
    { value: '#3b82f6', name: 'Azul' },
    { value: '#10b981', name: 'Verde' },
    { value: '#f59e0b', name: 'Amarelo' },
    { value: '#8b5cf6', name: 'Roxo' },
    { value: '#ec4899', name: 'Rosa' },
    { value: '#6b7280', name: 'Cinza' }
  ];

  // Obter dias do mês
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Formatar data para string
  const formatDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Navegar meses
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Abrir formulário de evento
  const openEventForm = (dateStr = null) => {
    setEventForm({
      title: '',
      date: dateStr || formatDateString(new Date()),
      color: '#ef4444',
      description: '',
      time: '',
      location: ''
    });
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  // Editar evento
  const editEvent = (dateStr, eventIndex) => {
    const event = events[dateStr][eventIndex];
    setEventForm({ ...event });
    setSelectedEvent({ dateStr, eventIndex });
    setShowEventForm(true);
  };

  // Salvar evento
  const saveEvent = () => {
    if (!eventForm.title || !eventForm.date) return;

    const newEvents = { ...events };
    
    if (selectedEvent) {
      // Editando evento existente
      const { dateStr, eventIndex } = selectedEvent;
      newEvents[dateStr][eventIndex] = { ...eventForm };
      showToast('Evento atualizado com sucesso!');
    } else {
      // Criando novo evento
      if (!newEvents[eventForm.date]) {
        newEvents[eventForm.date] = [];
      }
      newEvents[eventForm.date].push({ ...eventForm });
      showToast('Evento adicionado com sucesso!');
    }

    setEvents(newEvents);
    localStorage.setItem('pastoralCalendarEvents', JSON.stringify(newEvents));
    saveEventsToBackend(newEvents);
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  // Excluir evento
  const deleteEvent = (dateStr, eventIndex) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      const newEvents = { ...events };
      newEvents[dateStr].splice(eventIndex, 1);
      
      if (newEvents[dateStr].length === 0) {
        delete newEvents[dateStr];
      }
      
      setEvents(newEvents);
      localStorage.setItem('pastoralCalendarEvents', JSON.stringify(newEvents));
      showToast('Evento excluído com sucesso!', 'error');
    }
  };

  // Carregar eventos do localStorage
  React.useEffect(() => {
    const savedEvents = localStorage.getItem('pastoralCalendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Salvar eventos no backend
  const saveEventsToBackend = async (newEvents) => {
    try {
      await fetch('http://localhost:3001/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvents)
      });
    } catch (err) {
      // Pode mostrar toast de erro se quiser
    }
  };

  // Exportar eventos com filtro
  const exportEvents = () => {
    const now = new Date();
    let filteredEntries = Object.entries(events);

    if (exportRange === 'mes') {
      filteredEntries = filteredEntries.filter(([dateStr]) => {
        const d = new Date(dateStr);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (exportRange === '6meses') {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      filteredEntries = filteredEntries.filter(([dateStr]) => {
        const d = new Date(dateStr);
        return d >= sixMonthsAgo && d <= now;
      });
    } else if (exportRange === 'ano') {
      filteredEntries = filteredEntries.filter(([dateStr]) => {
        const d = new Date(dateStr);
        return d.getFullYear() === now.getFullYear();
      });
    }

    const eventsToExport = filteredEntries
      .flatMap(([dateStr, dayEvents]) => 
        dayEvents.map(event => {
          const dataFormatada = new Date(dateStr).toLocaleDateString('pt-BR');
          return `Data: ${dataFormatada}  Horário: ${event.time || '-'}  Evento: ${event.title}`;
        })
      )
      .join('\n');

    if (!eventsToExport) {
      alert('Nenhum evento encontrado para o período selecionado.');
      return;
    }

    const blob = new Blob([eventsToExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventos_pastoral_${new Date().getFullYear()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // Importar eventos
  const importEvents = () => {
    if (!importText.trim()) return;

    const newEvents = { ...events };
    let importCount = 0;

    importText.split('\n').forEach(line => {
      const [date, title, color, time] = line.split(';').map(s => s?.trim());
      
      if (date && title && color) {
        if (!newEvents[date]) {
          newEvents[date] = [];
        }
        
        newEvents[date].push({
          title,
          color,
          time: time || '',
          date
        });
        
        importCount++;
      }
    });

    if (importCount > 0) {
      setEvents(newEvents);
      localStorage.setItem('pastoralCalendarEvents', JSON.stringify(newEvents));
      setShowImportModal(false);
      setImportText('');
      alert(`${importCount} eventos importados com sucesso!`);
    } else {
      alert('Nenhum evento válido foi encontrado.');
    }
  };

  const days = getDaysInMonth(currentDate);
  const isCurrentMonth = (date) => date.getMonth() === currentDate.getMonth();
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-red-600">
            Calendário de Eventos - {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <p className="text-secondary-600 mt-1">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2"
            title="Exportar eventos"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Exportar</span>
          </button>
      {/* Modal de exportação de eventos */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Exportar Eventos</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <label className="block text-gray-700 font-medium mb-2">Selecione o período:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="exportRange" value="mes" checked={exportRange === 'mes'} onChange={() => setExportRange('mes')} />
                  Mês atual
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="exportRange" value="6meses" checked={exportRange === '6meses'} onChange={() => setExportRange('6meses')} />
                  Últimos 6 meses
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="exportRange" value="ano" checked={exportRange === 'ano'} onChange={() => setExportRange('ano')} />
                  Ano inteiro
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={exportEvents}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2"
            title="Importar eventos"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Importar</span>
          </button>
          <button 
            onClick={() => openEventForm()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Evento</span>
          </button>
        </div>
      </div>

      {/* Controles de navegação */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold text-secondary-900">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendário */}
      <div className="rounded-lg overflow-hidden shadow-lg">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 bg-red-500">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center font-bold text-white">
              {day}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7 bg-white" style={{ minWidth: '340px' }}>
          {days.map((day, index) => {
            const dateStr = formatDateString(day);
            const dayEvents = events[dateStr] || [];
            
            return (
              <div
                key={index}
                className={`calendar-cell min-h-[100px] p-2 border border-gray-200 cursor-pointer ${
                  !isCurrentMonth(day) ? 'other-month' : ''
                } ${isToday(day) ? 'today' : ''}`}
                onClick={() => openEventForm(dateStr)}
              >
                <div className={`text-lg font-bold mb-2 ${
                  isToday(day) ? 'text-blue-600' : isCurrentMonth(day) ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                
                {/* Eventos do dia */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="event-label text-xs px-2 py-1 rounded text-white font-medium cursor-pointer"
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        editEvent(dateStr, eventIndex);
                      }}
                      title={`${event.title}${event.time ? ` - ${event.time}` : ''}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de formulário de evento */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-red-100">
              <h2 className="text-xl font-bold text-red-600">
                {selectedEvent ? 'Editar Evento' : 'Adicionar Evento'}
              </h2>
              <button
                onClick={() => setShowEventForm(false)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Título do Evento</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Digite o título do evento"
                  maxLength={40}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Data</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Horário</label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Cor do Evento</label>
                <div className="flex gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        eventForm.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setEventForm({ ...eventForm, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              {selectedEvent && (
                <button
                  onClick={() => {
                    deleteEvent(selectedEvent.dateStr, selectedEvent.eventIndex);
                    setShowEventForm(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setShowEventForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEvent}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                disabled={!eventForm.title || !eventForm.date}
              >
                {selectedEvent ? 'Salvar Alterações' : 'Adicionar Evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de importação de eventos */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Importar Eventos</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Cole os eventos no formato:
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  2025-07-10;Reunião de Oração;#ef4444;19:30<br/>
                  2025-07-15;Ensaio do Coral;#3b82f6;18:00<br/>
                  2025-07-20;Culto Jovem;#10b981;19:00
                </div>
              </div>

              <textarea
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows="8"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Cole aqui os eventos para importar..."
              />
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={importEvents}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                disabled={!importText.trim()}
              >
                Importar Eventos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de eventos do mês */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Eventos de {months[currentDate.getMonth()]}
          </h2>
        </div>

        <div className="space-y-3">
          {futureMonthEvents.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Nenhum evento futuro para este mês.</div>
          ) : futureMonthEvents.map(({ event, dateStr, eventIndex, eventDateTime }) => {
            // Calcula tempo restante
            const now = new Date();
            const diffMs = eventDateTime - now;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            let tempoFalta = '';
            let destaque = '';
            if (diffDays === 1 && diffHours < 24) {
              destaque = 'bg-yellow-100 border-yellow-400';
            }
            if (diffDays > 0) {
              tempoFalta = `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
              if (diffHours > 0) tempoFalta += ` e ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            } else if (diffHours > 0) {
              tempoFalta = `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
              if (diffMinutes > 0) tempoFalta += ` e ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
            } else if (diffMinutes > 0) {
              tempoFalta = `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
            } else {
              tempoFalta = 'Agora';
            }
            return (
              <div 
                key={`${dateStr}-${eventIndex}`}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${destaque}`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{eventDateTime.toLocaleDateString('pt-BR')}</span>
                      {event.time && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </span>
                      )}
                      <span className="ml-2 text-green-600 font-semibold">Faltam {tempoFalta}</span>
                      {destaque && (
                        <span className="ml-2 px-2 py-1 rounded text-yellow-900 font-bold bg-yellow-200 border border-yellow-400">Destaque: Último dia!</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => editEvent(dateStr, eventIndex)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEvent(dateStr, eventIndex)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {Object.keys(events).filter(dateStr => {
            const eventDate = new Date(dateStr);
            return eventDate.getMonth() === currentDate.getMonth() && 
                   eventDate.getFullYear() === currentDate.getFullYear();
          }).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum evento programado para este mês</p>
              <button 
                onClick={() => openEventForm()}
                className="mt-2 text-red-600 hover:text-red-700 font-medium"
              >
                Clique aqui para adicionar o primeiro evento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-lg shadow-lg animate-fadein ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'error' ? (
              <X className="w-5 h-5" />
            ) : (
              <CalendarIcon className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

  </div>
 );
};

export default Calendar;
