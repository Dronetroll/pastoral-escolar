// Utilitários de validação para formulários do sistema
export const validationUtils = {
  // Validar email
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: regex.test(email),
      message: regex.test(email) ? '' : 'Email inválido'
    };
  },

  // Validar CPF
  cpf: (cpf) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      return { isValid: false, message: 'CPF deve ter 11 dígitos' };
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return { isValid: false, message: 'CPF inválido' };
    }

    // Validar dígitos verificadores
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) {
      return { isValid: false, message: 'CPF inválido' };
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) {
      return { isValid: false, message: 'CPF inválido' };
    }

    return { isValid: true, message: '' };
  },

  // Validar telefone
  phone: (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 11;
    
    return {
      isValid,
      message: isValid ? '' : 'Telefone deve ter 10 ou 11 dígitos'
    };
  },

  // Validar data de nascimento
  birthDate: (date) => {
    if (!date) return { isValid: false, message: 'Data é obrigatória' };
    
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate > today) {
      return { isValid: false, message: 'Data não pode ser futura' };
    }
    
    if (age > 120) {
      return { isValid: false, message: 'Data muito antiga' };
    }
    
    return { isValid: true, message: '' };
  },

  // Validar nome
  name: (name) => {
    const trimmedName = name.trim();
    const isValid = trimmedName.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName);
    
    return {
      isValid,
      message: isValid ? '' : 'Nome deve ter pelo menos 2 caracteres e conter apenas letras'
    };
  },

  // Validar evento
  event: {
    title: (title) => {
      const isValid = title.trim().length >= 3;
      return {
        isValid,
        message: isValid ? '' : 'Título deve ter pelo menos 3 caracteres'
      };
    },
    
    time: (startTime, endTime) => {
      if (!startTime || !endTime) {
        return { isValid: false, message: 'Horários são obrigatórios' };
      }
      
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(`2000-01-01 ${endTime}`);
      
      if (start >= end) {
        return { isValid: false, message: 'Horário de início deve ser anterior ao de fim' };
      }
      
      return { isValid: true, message: '' };
    },
    
    date: (date) => {
      if (!date) return { isValid: false, message: 'Data é obrigatória' };
      
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Permitir eventos do passado mas alertar
      if (eventDate < today) {
        return { isValid: true, message: 'Atenção: Data é do passado', warning: true };
      }
      
      return { isValid: true, message: '' };
    }
  },

  // Validar senha
  password: (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Pelo menos 1 letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Pelo menos 1 letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Pelo menos 1 número');
    }
    
    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : ''
    };
  },

  // Confirmar senha
  confirmPassword: (password, confirmPassword) => {
    const isValid = password === confirmPassword;
    return {
      isValid,
      message: isValid ? '' : 'Senhas não coincidem'
    };
  }
};

// Formatadores para inputs
export const formatters = {
  // Formatar CPF
  cpf: (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cleaned;
  },

  // Formatar telefone
  phone: (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11) {
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    } else if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return cleaned;
  },

  // Formatar CEP
  cep: (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return cleaned;
  },

  // Capitalizar nome
  name: (value) => {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};

// Hook personalizado para validação de formulários
import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    if (validationRules[name]) {
      const validation = validationRules[name](value, values);
      return validation;
    }
    return { isValid: true, message: '' };
  }, [validationRules, values]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validar em tempo real se o campo já foi tocado
    if (touched[name]) {
      const validation = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: validation.message
      }));
    }
  }, [validateField, touched]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const validation = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: validation.message
    }));
  }, [validateField, values]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const validation = validateField(name, values[name]);
      if (!validation.isValid) {
        newErrors[name] = validation.message;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return isValid;
  }, [validationRules, validateField, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  };
};

export default { validationUtils, formatters, useFormValidation };
