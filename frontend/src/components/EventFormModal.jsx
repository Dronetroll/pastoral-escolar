import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Bell, 
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Camera,
  Mic,
  Video,
  Tag,
  AlertCircle,
  CheckCircle,
  Save,
  Copy
} from 'lucide-react';

const EventFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingEvent = null,
  categories = [],
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '08:00',
    endTime: '09:00',
    category: '',
    priority: 'Média',
    responsavel: '',
    location: '',
    participants: [],
    attachments: [],
    isRecurring: false,
    recurrenceDays: [],
    hasReminder: false,
    reminderMinutes: 15,
    status: 'scheduled',
    notes: '',
    budget: '',
    resources: []
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [newParticipant, setNewParticipant] = useState('');
  const [newResource, setNewResource] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || editingEvent.description || '',
        description: editingEvent.description || '',
        date: editingEvent.date,
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        category: editingEvent.category || '',
        priority: editingEvent.priority || 'Média',
        responsavel: editingEvent.responsavel || '',
        location: editingEvent.location || '',
        participants: editingEvent.participants || [],
        attachments: editingEvent.attachments || [],
        isRecurring: editingEvent.isRecurring || false,
        recurrenceDays: editingEvent.recurrenceDays || [],
        hasReminder: editingEvent.hasReminder || false,
        reminderMinutes: editingEvent.reminderMinutes || 15,
        status: editingEvent.status || 'scheduled',
        notes: editingEvent.notes || '',
        budget: editingEvent.budget || '',
        resources: editingEvent.resources || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        startTime: '08:00',
        endTime: '09:00',
        category: '',
        priority: 'Média',
        responsavel: '',
        location: '',
        participants: [],
        attachments: [],
        isRecurring: false,
        recurrenceDays: [],
        hasReminder: false,
        reminderMinutes: 15,
        status: 'scheduled',
        notes: '',
        budget: '',
        resources: []
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [editingEvent, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Horário de início é obrigatório';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Horário de fim é obrigatório';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (start >= end) {
        newErrors.endTime = 'Horário de fim deve ser após o início';
      }
    }

    if (formData.isRecurring && formData.recurrenceDays.length === 0) {
      newErrors.recurrenceDays = 'Selecione pelo menos um dia para recorrência';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const addParticipant = () => {
    if (newParticipant.trim()) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, {
          id: Date.now(),
          name: newParticipant.trim(),
          email: '',
          confirmed: false
        }]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (id) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const addResource = () => {
    if (newResource.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, {
          id: Date.now(),
          name: newResource.trim(),
          quantity: 1,
          available: true
        }]
      }));
      setNewResource('');
    }
  };

  const removeResource = (id) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== id)
    }));
  };

  const toggleRecurrenceDay = (day) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  const duplicateEvent = () => {
    const newDate = new Date(formData.date);
    newDate.setDate(newDate.getDate() + 7);
    
    setFormData(prev => ({
      ...prev,
      date: newDate.toISOString().slice(0, 10),
      title: `${prev.title} (Cópia)`
    }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Básico', icon: Calendar },
    { id: 'details', label: 'Detalhes', icon: FileText },
    { id: 'participants', label: 'Participantes', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Bell }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {editingEvent && (
              <button
                type="button"
                onClick={duplicateEvent}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Duplicar evento"
              >
                <Copy className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-emerald-600 bg-emerald-50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab: Básico */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Reunião de Planejamento Pastoral"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Início *
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          errors.startTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.startTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fim *
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          errors.endTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.endTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Detalhes */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Descreva os detalhes do evento..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange('responsavel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Local do evento"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento
                  </label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="R$ 0,00"
                  />
                </div>

                {/* Recursos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recursos Necessários
                  </label>
                  <div className="space-y-2">
                    {formData.resources.map(resource => (
                      <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm">{resource.name}</span>
                        <button
                          type="button"
                          onClick={() => removeResource(resource.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newResource}
                        onChange={(e) => setNewResource(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Adicionar recurso..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                      />
                      <button
                        type="button"
                        onClick={addResource}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Participantes */}
            {activeTab === 'participants' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lista de Participantes
                  </label>
                  <div className="space-y-2">
                    {formData.participants.map(participant => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{participant.name}</span>
                          {participant.email && (
                            <span className="text-sm text-gray-500 ml-2">{participant.email}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeParticipant(participant.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newParticipant}
                        onChange={(e) => setNewParticipant(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Nome do participante..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                      />
                      <button
                        type="button"
                        onClick={addParticipant}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Configurações */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Recorrência */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                      Evento recorrente
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dias da semana
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleRecurrenceDay(day)}
                            className={`py-2 text-xs rounded-lg font-medium transition-colors ${
                              formData.recurrenceDays.includes(day)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      {errors.recurrenceDays && (
                        <p className="mt-1 text-sm text-red-600">{errors.recurrenceDays}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Lembrete */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="hasReminder"
                      checked={formData.hasReminder}
                      onChange={(e) => handleInputChange('hasReminder', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="hasReminder" className="text-sm font-medium text-gray-700">
                      Lembrete
                    </label>
                  </div>

                  {formData.hasReminder && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lembrar com antecedência
                      </label>
                      <select
                        value={formData.reminderMinutes}
                        onChange={(e) => handleInputChange('reminderMinutes', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value={5}>5 minutos</option>
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={120}>2 horas</option>
                        <option value={1440}>1 dia</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="in-progress">Em andamento</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {Object.keys(errors).length > 0 && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">
                    {Object.keys(errors).length} erro(s) encontrado(s)
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingEvent ? 'Atualizar' : 'Salvar'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
