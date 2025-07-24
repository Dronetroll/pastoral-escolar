import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

const FormInput = forwardRef(({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  warning,
  success,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  helpText,
  formatter,
  validator,
  maxLength,
  showCounter = false,
  autoComplete = 'off',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Aplicar formatação se especificada
    if (formatter) {
      newValue = formatter(newValue);
    }
    
    // Aplicar limite de caracteres
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    onChange(name, newValue);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(name);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const getInputClassName = () => {
    let classes = [
      'w-full px-3 py-2 border rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'placeholder-gray-400'
    ];

    if (disabled) {
      classes.push('bg-gray-100 text-gray-500 cursor-not-allowed');
    } else {
      classes.push('bg-white');
    }

    if (error) {
      classes.push('border-red-300 focus:border-red-500 focus:ring-red-200');
    } else if (warning) {
      classes.push('border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200');
    } else if (success) {
      classes.push('border-green-300 focus:border-green-500 focus:ring-green-200');
    } else {
      classes.push('border-gray-300 focus:border-blue-500 focus:ring-blue-200');
    }

    if (isFocused) {
      classes.push('shadow-sm');
    }

    return classes.join(' ') + ' ' + className;
  };

  const getLabelClassName = () => {
    let classes = ['block text-sm font-medium mb-1 transition-colors'];
    
    if (error) {
      classes.push('text-red-700');
    } else if (warning) {
      classes.push('text-yellow-700');
    } else if (success) {
      classes.push('text-green-700');
    } else {
      classes.push('text-gray-700');
    }

    return classes.join(' ');
  };

  const getMessageIcon = () => {
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (warning) return <Info className="w-4 h-4 text-yellow-500" />;
    if (success) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return null;
  };

  const getMessageClassName = () => {
    if (error) return 'text-red-600 text-xs mt-1';
    if (warning) return 'text-yellow-600 text-xs mt-1';
    if (success) return 'text-green-600 text-xs mt-1';
    return 'text-gray-500 text-xs mt-1';
  };

  const shouldShowPasswordToggle = type === 'password';
  const inputType = shouldShowPasswordToggle && showPassword ? 'text' : type;

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className={getLabelClassName()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={getInputClassName()}
          {...props}
        />
        
        {shouldShowPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
        
        {(error || warning || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {!shouldShowPasswordToggle && getMessageIcon()}
          </div>
        )}
      </div>
      
      {/* Contador de caracteres */}
      {showCounter && maxLength && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${
            (value?.length || 0) > maxLength * 0.9 ? 'text-yellow-600' : 'text-gray-400'
          }`}>
            {value?.length || 0}/{maxLength}
          </span>
        </div>
      )}
      
      {/* Mensagens de erro, aviso ou sucesso */}
      {(error || warning || success || helpText) && (
        <div className={getMessageClassName()}>
          <div className="flex items-center space-x-1">
            {(error || warning || success) && getMessageIcon()}
            <span>{error || warning || success || helpText}</span>
          </div>
        </div>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
