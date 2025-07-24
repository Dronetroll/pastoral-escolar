import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, MapPin, Users, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Sistema de notificações para eventos do calendário
const EventNotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [settings, setSettings] = useState({
    enableNotifications: true,
    notifyBefore: [15, 60, 24 * 60], // 15min, 1h, 1 dia
    soundEnabled: true,
    emailNotifications: false
  });

  useEffect(() => {
    loadUpcomingEvents();
    checkNotifications();
    
    // Verificar notificações a cada minuto
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Carregar eventos próximos
  const loadUpcomingEvents = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const params = new URLSearchParams({
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0]
      });

      const response = await fetch(`http://localhost:3001/api/eventos?${params}`);
      const data = await response.json();
      setUpcomingEvents(data.eventos);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  // Verificar se há eventos para notificar
  const checkNotifications = () => {
    if (!settings.enableNotifications) return;

    const now = new Date();
    const newNotifications = [];

    upcomingEvents.forEach(event => {
      const eventDate = new Date(event.dataInicio);
      const timeDiff = eventDate.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // Verificar se deve notificar
      if (event.notificarAntes && event.notificarAntes.includes(minutesDiff)) {
        const existingNotification = notifications.find(n => 
          n.eventId === event.id && n.minutesBefore === minutesDiff
        );

        if (!existingNotification) {
          newNotifications.push({
            id: `${event.id}-${minutesDiff}`,
            eventId: event.id,
            type: 'event_reminder',
            title: `Lembrete: ${event.titulo}`,
            message: `Evento em ${minutesDiff} minutos`,
            eventData: event,
            minutesBefore: minutesDiff,
            timestamp: new Date(),
            read: false
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
      
      // Mostrar toast para cada notificação
      newNotifications.forEach(notification => {
        toast.custom((t) => (
          <EventNotificationToast 
            notification={notification} 
            onDismiss={() => toast.dismiss(t.id)}
            onAction={() => handleNotificationAction(notification)}
          />
        ), {
          duration: 10000,
          position: 'top-right'
        });

        // Som de notificação
        if (settings.soundEnabled) {
          playNotificationSound();
        }
      });
    }
  };

  // Tocar som de notificação
  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Erro ao tocar som:', e));
  };

  // Ação da notificação (abrir evento)
  const handleNotificationAction = (notification) => {
    // Aqui você pode abrir o modal do evento ou navegar para a página do evento
    console.log('Abrir evento:', notification.eventData);
    markAsRead(notification.id);
  };

  // Marcar notificação como lida
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Remover notificação
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Componente do toast de notificação
  const EventNotificationToast = ({ notification, onDismiss, onAction }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{notification.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {new Date(notification.eventData.dataInicio).toLocaleString('pt-BR')}
          </div>
          
          {notification.eventData.local && (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {notification.eventData.local}
            </div>
          )}
        </div>
        
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={onAction}
          className="flex-1 bg-primary-600 text-white text-sm px-3 py-1 rounded hover:bg-primary-700 transition-colors"
        >
          Ver Evento
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Dispensar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Centro de notificações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Notificações de Eventos</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {notifications.filter(n => !n.read).length} não lidas
            </span>
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Limpar todas
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma notificação pendente</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={() => markAsRead(notification.id)}
                onRemove={() => removeNotification(notification.id)}
                onAction={() => handleNotificationAction(notification)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Próximos eventos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Próximos Eventos (7 dias)</h3>
        
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum evento próximo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map(event => (
              <UpcomingEventItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Configurações de notificação */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Configurações de Notificação</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                enableNotifications: e.target.checked
              }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Ativar notificações de eventos</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                soundEnabled: e.target.checked
              }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Som de notificação</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailNotifications: e.target.checked
              }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Notificações por email</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Componente de item de notificação
const NotificationItem = ({ notification, onMarkRead, onRemove, onAction }) => (
  <div className={`p-3 rounded-lg border ${
    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
  }`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(notification.eventData.dataInicio).toLocaleString('pt-BR')}
          </div>
          
          {notification.eventData.local && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {notification.eventData.local}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 ml-3">
        {!notification.read && (
          <button
            onClick={onMarkRead}
            className="p-1 text-blue-600 hover:text-blue-700"
            title="Marcar como lida"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Remover"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div className="flex gap-2 mt-3">
      <button
        onClick={onAction}
        className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
      >
        Ver Evento
      </button>
    </div>
  </div>
);

// Componente de evento próximo
const UpcomingEventItem = ({ event }) => {
  const eventDate = new Date(event.dataInicio);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const isTomorrow = eventDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  const getTimeUntil = () => {
    const diff = eventDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (isToday) {
      if (hours > 0) return `em ${hours}h ${minutes}min`;
      return `em ${minutes}min`;
    }
    if (isTomorrow) return 'amanhã';
    return eventDate.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className={`w-3 h-3 rounded-full ${
        event.categoria ? 
        `bg-${event.cor || '#3B82F6'}` : 
        'bg-gray-400'
      }`} />
      
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{event.titulo}</h4>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeUntil()}
          </div>
          
          {event.local && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.local}
            </div>
          )}
          
          {event.estimativaParticipantes && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.estimativaParticipantes}
            </div>
          )}
        </div>
      </div>
      
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        isToday ? 'bg-red-100 text-red-700' :
        isTomorrow ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {event.categoria || 'Evento'}
      </div>
    </div>
  );
};

export default EventNotificationSystem;
