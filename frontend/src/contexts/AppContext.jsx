import React, { createContext, useContext, useReducer } from 'react';

// Estados iniciais
const initialState = {
  // Loading states
  loading: {
    global: false,
    calendar: false,
    events: false,
    students: false,
    baptisms: false,
    reports: false
  },
  
  // User state
  user: {
    id: null,
    name: 'Pastor João Silva',
    email: 'pastor@escola.com',
    role: 'ADMIN',
    avatar: null,
    isAuthenticated: true // Para demo
  },
  
  // Notifications
  notifications: [],
  
  // App settings
  settings: {
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    autoSave: true,
    soundEnabled: true,
    emailNotifications: true,
    pushNotifications: true
  },
  
  // Cache status
  cache: {
    lastCleared: null,
    size: 0
  },
  
  // Errors
  errors: []
};

// Action types
const ActionTypes = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  
  // User actions
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER',
  LOGOUT_USER: 'LOGOUT_USER',
  
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  
  // Error actions
  ADD_ERROR: 'ADD_ERROR',
  REMOVE_ERROR: 'REMOVE_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  
  // Cache actions
  UPDATE_CACHE_STATUS: 'UPDATE_CACHE_STATUS'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };

    case ActionTypes.SET_GLOBAL_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          global: action.payload
        }
      };

    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };

    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case ActionTypes.LOGOUT_USER:
      return {
        ...state,
        user: {
          ...initialState.user,
          isAuthenticated: false
        }
      };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };

    case ActionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case ActionTypes.RESET_SETTINGS:
      return {
        ...state,
        settings: initialState.settings
      };

    case ActionTypes.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, action.payload]
      };

    case ActionTypes.REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter(e => e.id !== action.payload)
      };

    case ActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: []
      };

    case ActionTypes.UPDATE_CACHE_STATUS:
      return {
        ...state,
        cache: {
          ...state.cache,
          ...action.payload
        }
      };

    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    // Loading actions
    setLoading: (key, value) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key, value } });
    },

    setGlobalLoading: (value) => {
      dispatch({ type: ActionTypes.SET_GLOBAL_LOADING, payload: value });
    },

    // User actions
    setUser: (user) => {
      dispatch({ type: ActionTypes.SET_USER, payload: user });
    },

    updateUser: (updates) => {
      dispatch({ type: ActionTypes.UPDATE_USER, payload: updates });
    },

    logout: () => {
      dispatch({ type: ActionTypes.LOGOUT_USER });
      // Limpar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // Notification actions
    addNotification: (notification) => {
      const id = Date.now() + Math.random();
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { id, ...notification, timestamp: new Date() }
      });
      
      // Auto-remove após 5 segundos se for tipo info
      if (notification.type === 'info') {
        setTimeout(() => {
          actions.removeNotification(id);
        }, 5000);
      }
    },

    removeNotification: (id) => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    },

    clearNotifications: () => {
      dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS });
    },

    markNotificationRead: (id) => {
      dispatch({ type: ActionTypes.MARK_NOTIFICATION_READ, payload: id });
    },

    // Settings actions
    updateSettings: (settings) => {
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
      // Salvar no localStorage
      localStorage.setItem('app_settings', JSON.stringify({ ...state.settings, ...settings }));
    },

    resetSettings: () => {
      dispatch({ type: ActionTypes.RESET_SETTINGS });
      localStorage.removeItem('app_settings');
    },

    // Error actions
    addError: (error) => {
      const id = Date.now() + Math.random();
      dispatch({
        type: ActionTypes.ADD_ERROR,
        payload: { id, ...error, timestamp: new Date() }
      });
      
      // Auto-remove após 10 segundos
      setTimeout(() => {
        actions.removeError(id);
      }, 10000);
    },

    removeError: (id) => {
      dispatch({ type: ActionTypes.REMOVE_ERROR, payload: id });
    },

    clearErrors: () => {
      dispatch({ type: ActionTypes.CLEAR_ERRORS });
    },

    // Cache actions
    updateCacheStatus: (status) => {
      dispatch({ type: ActionTypes.UPDATE_CACHE_STATUS, payload: status });
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook para usar o contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};

// Hook específico para loading
export const useLoading = (key) => {
  const { state, actions } = useApp();
  
  return {
    loading: state.loading[key] || false,
    setLoading: (value) => actions.setLoading(key, value),
    globalLoading: state.loading.global
  };
};

// Hook específico para notificações
export const useNotifications = () => {
  const { state, actions } = useApp();
  
  return {
    notifications: state.notifications,
    addNotification: actions.addNotification,
    removeNotification: actions.removeNotification,
    clearNotifications: actions.clearNotifications,
    markAsRead: actions.markNotificationRead,
    unreadCount: state.notifications.filter(n => !n.read).length
  };
};

// Hook específico para usuário
export const useUser = () => {
  const { state, actions } = useApp();
  
  return {
    user: state.user,
    setUser: actions.setUser,
    updateUser: actions.updateUser,
    logout: actions.logout,
    isAuthenticated: state.user.isAuthenticated
  };
};

// Hook específico para configurações
export const useSettings = () => {
  const { state, actions } = useApp();
  
  return {
    settings: state.settings,
    updateSettings: actions.updateSettings,
    resetSettings: actions.resetSettings
  };
};

export default AppContext;
