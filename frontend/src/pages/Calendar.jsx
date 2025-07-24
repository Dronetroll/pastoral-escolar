import React from 'react';
import { format } from 'date-fns';
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
  Upload,
  Search,
  Filter,
  Users,
  MapPin,
  User,
  Repeat,
  Tag,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';
import '../styles/calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [events, setEvents] = React.useState({});
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [editingEvent, setEditingEvent] = React.useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState(null);
  const [exportRange, setExportRange] = React.useState('mes');
  const [importText, setImportText] = React.useState('');
  const [toast, setToast] = React.useState(null);
  
  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  
  // Estados para gerenciamento de categorias e cores
  const [showCategoryManager, setShowCategoryManager] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryIcon, setNewCategoryIcon] = React.useState('📅');
  const [customCategories, setCustomCategories] = React.useState([]);
  
  // Estados para formulário expandido
  const [eventForm, setEventForm] = React.useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    color: '#3b82f6',
    category: '',
    location: '',
    responsible: '',
    description: '',
    isRecurring: false,
    recurringType: 'weekly',
    recurringEnd: ''
  });

  // Estado para atualização em tempo real
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Definir arrays necessários
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Categorias de eventos pastorais
  const eventCategories = [
    { id: 'culto', name: 'Culto', icon: '🙏', color: '#ef4444' },
    { id: 'reuniao', name: 'Reunião de Oração', icon: '🤲', color: '#3b82f6' },
    { id: 'ensaio', name: 'Ensaio do Coral', icon: '🎵', color: '#10b981' },
    { id: 'estudo', name: 'Estudo Bíblico', icon: '📖', color: '#f59e0b' },
    { id: 'visita', name: 'Visita Pastoral', icon: '🏠', color: '#8b5cf6' },
    { id: 'jovem', name: 'Culto Jovem', icon: '🌟', color: '#ec4899' },
    { id: 'infantil', name: 'Culto Infantil', icon: '👶', color: '#06b6d4' },
    { id: 'batismo', name: 'Batismo', icon: '💦', color: '#0ea5e9' },
    { id: 'casamento', name: 'Casamento', icon: '💒', color: '#f97316' },
    { id: 'funeral', name: 'Funeral', icon: '🕊️', color: '#6b7280' },
    { id: 'evento', name: 'Evento Especial', icon: '⭐', color: '#dc2626' },
    { id: 'outros', name: 'Outros', icon: '📅', color: '#64748b' }
  ];

  // Função para obter todas as categorias (padrão + personalizadas)
  const getAllCategories = () => {
    return [...eventCategories, ...customCategories];
  };

  // Paleta de cores expandida
  const colorPalette = [
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b', // Vermelhos
    '#f97316', '#ea580c', '#c2410c', '#9a3412', // Laranjas  
    '#f59e0b', '#d97706', '#b45309', '#92400e', // Amarelos
    '#10b981', '#059669', '#047857', '#065f46', // Verdes
    '#06b6d4', '#0891b2', '#0e7490', '#155e75', // Cianos
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', // Azuis
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', // Roxos
    '#ec4899', '#db2777', '#be185d', '#9d174d', // Rosas
    '#6b7280', '#4b5563', '#374151', '#1f2937'  // Cinzas
  ];

  // Função para mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Função para ir para hoje
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Função para navegar entre meses
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Função para obter dias do mês
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Adicionar dias do mês anterior
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonth.getDate() - i));
    }

    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Adicionar dias do próximo mês
    const totalCells = 42; // 6 semanas × 7 dias
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  };

  // Função para formatar data
  const formatDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Carregar eventos do localStorage
  React.useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    // Tentar carregar eventos do backend também
    loadInitialEventsFromBackend();
  }, []);

  // Atualizar tempo a cada minuto para contagem regressiva
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(timer);
  }, []);

  // Carregar eventos do backend na inicialização
  const loadInitialEventsFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/eventos');
      if (response.ok) {
        const backendEvents = await response.json();
        // Converter eventos do backend para o formato do calendário
        const formattedEvents = {};
        backendEvents.forEach(event => {
          const date = new Date(event.dataInicio).toISOString().split('T')[0];
          if (!formattedEvents[date]) {
            formattedEvents[date] = [];
          }
          formattedEvents[date].push({
            title: event.titulo,
            color: event.cor || '#3b82f6',
            time: new Date(event.dataInicio).toTimeString().slice(0, 5),
            endTime: event.dataFim ? new Date(event.dataFim).toTimeString().slice(0, 5) : '',
            date: date
          });
        });
        
        // Mesclar com eventos locais
        const savedEvents = localStorage.getItem('calendarEvents');
        const localEvents = savedEvents ? JSON.parse(savedEvents) : {};
        const mergedEvents = { ...formattedEvents, ...localEvents };
        
        setEvents(mergedEvents);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos do backend:', error);
    }
  };

  // Função para abrir modal de detalhes do evento
  const openEventDetails = (event, dateStr) => {
    setSelectedEvent({ ...event, date: dateStr });
    setShowEventDetailsModal(true);
  };

  // Função para editar evento
  const editEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      startTime: event.time,
      endTime: event.endTime || '',
      color: event.color,
      category: event.category || '',
      location: event.location || '',
      responsible: event.responsible || '',
      description: event.description || '',
      isRecurring: event.isRecurring || false,
      recurringType: event.recurringType || 'weekly',
      recurringEnd: event.recurringEnd || ''
    });
    setShowEventDetailsModal(false);
    setShowEventModal(true);
  };

  // Função para confirmar exclusão
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirmModal(true);
  };

  // Função para executar exclusão confirmada
  const executeDelete = async () => {
    if (eventToDelete) {
      await deleteEvent(eventToDelete);
      setShowDeleteConfirmModal(false);
      setEventToDelete(null);
    }
  };

  // Função para cancelar exclusão
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setEventToDelete(null);
  };

  // Função para filtrar eventos
  const filteredEvents = React.useMemo(() => {
    const allEvents = [];
    
    // Converter objeto events para array
    Object.entries(events).forEach(([date, dayEvents]) => {
      dayEvents.forEach(event => {
        allEvents.push({ ...event, date });
      });
    });
    
    return allEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (event.responsible && event.responsible.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Função para obter ícone da categoria
  const getCategoryIcon = (categoryId) => {
    const category = getAllCategories().find(cat => cat.id === categoryId);
    return category ? category.icon : '';
  };

  // Função para formatar data no padrão brasileiro
  const formatDateBR = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para obter eventos do dia
  const getEventsForDay = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayEvents = events[dateString] || [];
    
    // Aplicar filtros apenas se existirem filtros ativos
    if (searchTerm || selectedCategory) {
      return dayEvents.filter(event => {
        const matchesSearch = searchTerm === '' || 
                             event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (event.responsible && event.responsible.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = selectedCategory === '' || event.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
    }
    
    return dayEvents;
  };

  // Função para inicializar formulário
  const initializeForm = (date = null) => {
    setEventForm({
      title: '',
      date: date ? format(date, 'yyyy-MM-dd') : '',
      startTime: '',
      endTime: '',
      color: '#ef4444',
      category: '',
      location: '',
      responsible: '',
      description: '',
      isRecurring: false,
      recurringType: 'weekly',
      recurringEnd: ''
    });
  };

  // Função para fechar modal e resetar
  const closeModal = () => {
    setShowEventModal(false);
    setShowEventDetailsModal(false);
    setEditingEvent(null);
    setShowCategoryManager(false);
    setShowColorPicker(false);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('📅');
    initializeForm();
  };

  // Funções para gerenciar categorias
  const addNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `custom_${Date.now()}`,
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        color: eventForm.color
      };
      
      // Adicionar nova categoria ao estado
      setCustomCategories([...customCategories, newCategory]);
      
      // Selecionar a nova categoria
      setEventForm({...eventForm, category: newCategory.id});
      
      // Resetar campos
      setNewCategoryName('');
      setNewCategoryIcon('📅');
    }
  };

  const removeCategory = (categoryId) => {
    if (categoryId.startsWith('custom_')) {
      // Remover categoria personalizada
      setCustomCategories(customCategories.filter(cat => cat.id !== categoryId));
      
      // Se a categoria removida estava selecionada, limpar seleção
      if (eventForm.category === categoryId) {
        setEventForm({...eventForm, category: ''});
      }
    }
  };

  const startEditingCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
  };

  const saveEditCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      const updatedCategories = customCategories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: newCategoryName.trim(), icon: newCategoryIcon }
          : cat
      );
      
      setCustomCategories(updatedCategories);
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryIcon('📅');
    }
  };

  // Função para deletar evento
  const deleteEvent = async (eventToDelete) => {
    const newEvents = { ...events };
    const dateEvents = newEvents[eventToDelete.date];
    
    if (dateEvents) {
      // Remover o evento específico
      const updatedEvents = dateEvents.filter((event, index) => 
        !(event.title === eventToDelete.title && 
          event.time === eventToDelete.time && 
          event.color === eventToDelete.color)
      );
      
      if (updatedEvents.length === 0) {
        delete newEvents[eventToDelete.date];
      } else {
        newEvents[eventToDelete.date] = updatedEvents;
      }
      
      // Atualizar localStorage
      localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
      
      // Tentar deletar do backend também
      try {
        const response = await fetch(`http://localhost:3005/api/eventos/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: eventToDelete.title,
            dataInicio: `${eventToDelete.date}T${eventToDelete.time}:00`
          })
        });
        
        if (response.ok) {
          showToast('Evento excluído com sucesso!');
        } else {
          showToast('Evento removido localmente (erro no servidor)', 'info');
        }
      } catch (error) {
        console.error('Erro ao deletar no backend:', error);
        showToast('Evento removido localmente (erro no servidor)', 'info');
      }
      
      setEvents(newEvents);
      setShowEventDetailsModal(false);
    }
  };

  // Salvar novo evento ou editar existente
  // Salvar novo evento ou editar existente
  const saveNewEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      title: eventForm.title,
      color: eventForm.color,
      time: eventForm.startTime,
      endTime: eventForm.endTime,
      date: eventForm.date,
      category: eventForm.category,
      location: eventForm.location,
      responsible: eventForm.responsible,
      description: eventForm.description,
      isRecurring: eventForm.isRecurring,
      recurringType: eventForm.recurringType,
      recurringEnd: eventForm.recurringEnd
    };

    const newEvents = { ...events };

    // Se estamos editando um evento existente
    if (editingEvent) {
      // Remover o evento antigo
      const oldDateEvents = newEvents[editingEvent.date];
      if (oldDateEvents) {
        const filteredEvents = oldDateEvents.filter((event) => 
          !(event.title === editingEvent.title && 
            event.time === editingEvent.time && 
            event.color === editingEvent.color)
        );
        
        if (filteredEvents.length === 0) {
          delete newEvents[editingEvent.date];
        } else {
          newEvents[editingEvent.date] = filteredEvents;
        }
      }
      
      // Deletar do backend o evento antigo
      try {
        await fetch(`http://localhost:3005/api/eventos/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: editingEvent.title,
            dataInicio: `${editingEvent.date}T${editingEvent.time}:00`
          })
        });
      } catch (error) {
        console.error('Erro ao deletar evento antigo do backend:', error);
      }
    }

    // Adicionar o evento (novo ou editado) na nova data
    if (!newEvents[eventForm.date]) {
      newEvents[eventForm.date] = [];
    }
    newEvents[eventForm.date].push(newEvent);

    // Salvar no localStorage
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
    
    // Salvar no backend
    try {
      await fetch('http://localhost:3005/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: eventForm.title,
          cor: eventForm.color,
          dataInicio: `${eventForm.date}T${eventForm.startTime}:00`,
          dataFim: `${eventForm.date}T${eventForm.endTime}:00`
        })
      });
      showToast(editingEvent ? 'Evento atualizado com sucesso!' : 'Evento registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar no backend:', error);
      showToast('Evento salvo localmente (erro no servidor)', 'info');
    }

    // Atualizar estado e fechar modal
    setEvents(newEvents);
    closeModal();
  };

  // Salvar eventos no backend
  const saveEventsToBackend = async (newEvents) => {
    try {
      await fetch('http://localhost:3005/api/eventos', {
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
      showToast('Nenhum evento encontrado para o período selecionado.', 'error');
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
    showToast('Eventos exportados com sucesso!');
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
      localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
      saveEventsToBackend(newEvents);
      setShowImportModal(false);
      setImportText('');
      showToast(`${importCount} eventos importados com sucesso!`);
    } else {
      showToast('Nenhum evento válido foi encontrado.', 'error');
    }
  };

  const days = getDaysInMonth(currentDate);
  const isCurrentMonth = (date) => date.getMonth() === currentDate.getMonth();
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Contar eventos do mês atual
  const currentMonthEventsCount = Object.keys(events).filter(dateStr => {
    const eventDate = new Date(dateStr);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  }).reduce((total, dateStr) => total + events[dateStr].length, 0);

  // Função para calcular tempo restante até um evento
  const getTimeUntilEvent = (eventDate, eventTime) => {
    const now = currentTime;
    const [hours, minutes] = eventTime.split(':');
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const timeDiff = eventDateTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) return null; // Evento já passou
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours: remainingHours, minutes: remainingMinutes, totalMilliseconds: timeDiff };
  };

  // Função para determinar cor baseada na proximidade
  const getUrgencyColor = (timeUntil) => {
    if (!timeUntil) return 'gray';
    
    const { totalMilliseconds } = timeUntil;
    const hoursUntil = totalMilliseconds / (1000 * 60 * 60);
    
    if (hoursUntil <= 2) return 'red'; // Menos de 2 horas - Vermelho
    if (hoursUntil <= 24) return 'orange'; // Menos de 1 dia - Laranja  
    if (hoursUntil <= 72) return 'yellow'; // Menos de 3 dias - Amarelo
    return 'green'; // Mais de 3 dias - Verde
  };

  // Obter eventos futuros do mês atual ordenados por proximidade
  const upcomingEvents = React.useMemo(() => {
    const now = currentTime;
    const events_list = [];
    
    Object.entries(events)
      .filter(([dateStr]) => {
        const eventDate = new Date(dateStr);
        return eventDate.getMonth() === currentDate.getMonth() && 
               eventDate.getFullYear() === currentDate.getFullYear();
      })
      .forEach(([dateStr, dayEvents]) => {
        dayEvents.forEach((event) => {
          if (event.time) {
            const timeUntil = getTimeUntilEvent(dateStr, event.time);
            if (timeUntil) { // Só adiciona eventos futuros
              events_list.push({
                ...event,
                date: dateStr,
                timeUntil,
                urgencyColor: getUrgencyColor(timeUntil)
              });
            }
          }
        });
      });
    
    // Ordenar por proximidade (menor tempo primeiro)
    return events_list.sort((a, b) => a.timeUntil.totalMilliseconds - b.timeUntil.totalMilliseconds);
  }, [events, currentDate, currentTime]);

  // Função para formatar tempo restante
  const formatTimeUntil = (timeUntil) => {
    const { days, hours, minutes } = timeUntil;
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e controles */}
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
          {currentMonthEventsCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {currentMonthEventsCount} evento{currentMonthEventsCount !== 1 ? 's' : ''} este mês
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`${showFilters ? 'bg-red-500' : 'bg-gray-500'} hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2`}
            title="Filtros e busca"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filtros</span>
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2"
            title="Exportar eventos"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Exportar</span>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2"
            title="Importar eventos"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Importar</span>
          </button>
          <button 
            onClick={() => {
              initializeForm();
              setShowEventModal(true);
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2"
            title="Registrar evento"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Registrar</span>
          </button>
          <button 
            onClick={() => setShowCategoryManager(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center space-x-2"
            title="Gerenciar categorias"
          >
            <Tag className="w-4 h-4" />
            <span className="hidden md:inline">Categorias</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Campo de busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filtro por categoria */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Todas as categorias</option>
                {getAllCategories().map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Botão de limpar filtros */}
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
      {/* Controles de navegação */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-secondary-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-red-500 hover:bg-red-100 rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>
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
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={index}
                className={`calendar-cell min-h-[100px] p-2 border border-gray-200 ${
                  !isCurrentMonth(day) ? 'other-month' : ''
                } ${isToday(day) ? 'today' : ''}`}
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
                      className="event-label text-xs px-2 py-1 rounded text-white font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                      style={{ backgroundColor: event.color }}
                      title={`${getCategoryIcon(event.category)} ${event.title}${event.time ? ` - ${event.time}${event.endTime ? ' até ' + event.endTime : ''}` : ''}${event.location ? ` - ${event.location}` : ''}`}
                      onClick={() => openEventDetails(event, dateStr)}
                    >
                      <span className="text-xs">{getCategoryIcon(event.category)}</span>
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div 
                      className="text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-700"
                      onClick={() => {
                        if (dayEvents.length > 3) {
                          openEventDetails(dayEvents[3], dateStr);
                        }
                      }}
                    >
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Modal de registro de evento */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Editar Evento' : 'Registrar Evento'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Conteúdo do modal com scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nome do Evento *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Digite o nome do evento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoria *</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => {
                      const category = getAllCategories().find(cat => cat.id === e.target.value);
                      setEventForm({
                        ...eventForm, 
                        category: e.target.value,
                        color: category ? category.color : eventForm.color
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria</option>
                    {getAllCategories().map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Data *</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Horário Início *</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Horário Fim *</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Local</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Onde será realizado"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Responsável</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={eventForm.responsible}
                      onChange={(e) => setEventForm({...eventForm, responsible: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>
              </div>

              {/* Evento recorrente */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={eventForm.isRecurring}
                    onChange={(e) => setEventForm({...eventForm, isRecurring: e.target.checked})}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isRecurring" className="text-gray-700 font-medium flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Evento recorrente
                  </label>
                </div>

                {eventForm.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Frequência</label>
                      <select
                        value={eventForm.recurringType}
                        onChange={(e) => setEventForm({...eventForm, recurringType: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Repetir até</label>
                      <input
                        type="date"
                        value={eventForm.recurringEnd}
                        onChange={(e) => setEventForm({...eventForm, recurringEnd: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Seletor de Cor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700 font-medium">Cor do Evento</label>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: eventForm.color }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {showColorPicker ? 'Fechar' : 'Escolher Cor'}
                    </span>
                  </button>
                </div>
                
                {showColorPicker && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-9 gap-2 max-h-32 overflow-y-auto">
                      {colorPalette.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setEventForm({...eventForm, color});
                            setShowColorPicker(false);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            eventForm.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botões fixos na parte inferior */}
            <div className="flex gap-3 p-6 border-t bg-white rounded-b-lg">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveNewEvent}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
              >
                {editingEvent ? 'Atualizar Evento' : 'Salvar Evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes do evento */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Evento</h2>
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedEvent.color }}
                />
                <span className="text-lg">{getCategoryIcon(selectedEvent.category)}</span>
                <h3 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h3>
              </div>
              
              <div className="space-y-3 text-gray-600">
                {selectedEvent.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>
                      {getAllCategories().find(cat => cat.id === selectedEvent.category)?.name || 'Categoria não definida'}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {new Date(selectedEvent.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {selectedEvent.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {selectedEvent.time}
                      {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                    </span>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.responsible && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{selectedEvent.responsible}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-1">Descrição:</h4>
                    <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.isRecurring && (
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    <span>
                      Evento recorrente - {
                        selectedEvent.recurringType === 'daily' ? 'Diário' :
                        selectedEvent.recurringType === 'weekly' ? 'Semanal' :
                        selectedEvent.recurringType === 'monthly' ? 'Mensal' : 'Personalizado'
                      }
                      {selectedEvent.recurringEnd && ` até ${formatDateBR(selectedEvent.recurringEnd)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => editEvent(selectedEvent)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => confirmDelete(selectedEvent)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirmModal && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
            {/* Cabeçalho com ícone de alerta */}
            <div className="flex items-center justify-center p-6 bg-red-50 rounded-t-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Confirmar Exclusão
              </h3>
              
              <p className="text-gray-600 mb-2">
                Tem certeza que deseja excluir este evento?
              </p>
              
              {/* Detalhes do evento a ser excluído */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4 mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: eventToDelete.color }}
                  />
                  <span className="font-semibold text-gray-900">{eventToDelete.title}</span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {new Date(eventToDelete.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  
                  {eventToDelete.time && (
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {eventToDelete.time}
                        {eventToDelete.endTime && ` - ${eventToDelete.endTime}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Esta ação não pode ser desfeita
              </p>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Categorias */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Gerenciar Categorias
              </h2>
              <button
                onClick={() => {
                  setShowCategoryManager(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                  setNewCategoryIcon('📅');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Conteúdo do modal com scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Adicionar nova categoria */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-600" />
                  Adicionar Nova Categoria
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    className="w-16 border rounded-lg px-2 py-2 text-center text-lg"
                    placeholder="📅"
                    maxLength="2"
                  />
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nome da categoria"
                  />
                  <button
                    type="button"
                    onClick={addNewCategory}
                    disabled={!newCategoryName.trim()}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de categorias existentes */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Categorias Existentes
                </h3>
                <div className="grid gap-3">
                  {getAllCategories().map(category => (
                    <div key={category.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <span className="font-medium text-gray-900">{category.name}</span>
                          <div className="text-sm text-gray-500">
                            {category.id.startsWith('custom_') ? 'Categoria personalizada' : 'Categoria padrão'}
                          </div>
                        </div>
                      </div>
                      {category.id.startsWith('custom_') && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingCategory(category)}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Editar categoria"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCategory(category.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remover categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal de edição inline */}
              {editingCategory && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Edit className="w-4 h-4 text-blue-600" />
                    Editando: {editingCategory.name}
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      className="w-16 border rounded-lg px-2 py-2 text-center text-lg"
                      maxLength="2"
                    />
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={saveEditCategory}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategoryName('');
                        setNewCategoryIcon('📅');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Botão de fechar */}
            <div className="p-6 border-t bg-white rounded-b-lg">
              <button
                onClick={() => {
                  setShowCategoryManager(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                  setNewCategoryIcon('📅');
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Eventos Futuros */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-500 text-white px-6 py-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximos Eventos do Mês
              {upcomingEvents.length > 0 && (
                <span className="bg-red-600 text-xs px-2 py-1 rounded-full">
                  {upcomingEvents.length}
                </span>
              )}
            </h3>
          </div>
          
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  });
                  
                  return (
                    <div
                      key={`${event.date}-${event.title}-${index}`}
                      className={`p-4 rounded-lg border-l-4 ${
                        event.urgencyColor === 'red' ? 'border-red-500 bg-red-50' :
                        event.urgencyColor === 'orange' ? 'border-orange-500 bg-orange-50' :
                        event.urgencyColor === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                        'border-green-500 bg-green-50'
                      } transition-all duration-300 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                            <h4 className="font-bold text-gray-900">{event.title}</h4>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span className="capitalize">{formattedDate}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {event.time}
                                {event.endTime && ` - ${event.endTime}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              event.urgencyColor === 'red' ? 'bg-red-100 text-red-800' :
                              event.urgencyColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                              event.urgencyColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {formatTimeUntil(event.timeUntil)}
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {event.urgencyColor === 'red' ? 'Muito urgente!' :
                             event.urgencyColor === 'orange' ? 'Urgente' :
                             event.urgencyColor === 'yellow' ? 'Em breve' :
                             'No prazo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum evento futuro para este mês</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mensagem de nenhum evento programado */}
      {Object.keys(events).filter(dateStr => {
        const eventDate = new Date(dateStr);
        return eventDate.getMonth() === currentDate.getMonth() && 
               eventDate.getFullYear() === currentDate.getFullYear();
      }).length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhum evento programado para este mês</p>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-lg shadow-lg animate-fadein ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 
          toast.type === 'info' ? 'bg-blue-500 text-white' : 
          'bg-green-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'error' ? (
              <X className="w-5 h-5" />
            ) : toast.type === 'info' ? (
              <Clock className="w-5 h-5" />
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
