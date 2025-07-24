import React, { useState, useEffect } from 'react';
import ResponsiveCalendar from '../components/ResponsiveCalendar';
import EventNotificationSystem from '../components/EventNotificationSystem';

const AdvancedCalendarPage = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Calendário Avançado</h1>
          <p className="text-secondary-600">Sistema completo de gerenciamento de eventos com notificações</p>
        </div>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="btn-secondary flex items-center gap-2"
        >
          🔔 {showNotifications ? 'Ocultar' : 'Mostrar'} Notificações
        </button>
      </div>

      {/* Sistema de notificações */}
      {showNotifications && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveCalendar />
          </div>
          <div>
            <EventNotificationSystem />
          </div>
        </div>
      )}

      {/* Calendário principal */}
      {!showNotifications && <ResponsiveCalendar />}
    </div>
  );
};

export default AdvancedCalendarPage;
