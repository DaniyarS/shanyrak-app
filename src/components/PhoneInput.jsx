import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Input.css';

// Valid Kazakhstan mobile operator codes
const KZ_OPERATOR_CODES = [
  '700', '701', '702', '705', '706', '707', '708', '709',
  '747', '750', '751', '760', '761', '762', '763', '764',
  '771', '775', '776', '777', '778'
];

const PhoneInput = ({ value, onChange, error, required, label, disabled }) => {
  const { t } = useLanguage();
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);

  // Format phone number for display: +7 (707) 111 11 11
  const formatPhoneForDisplay = (phone) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;

    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  };

  // Convert display format to backend format: 77071112244
  const formatPhoneForBackend = (displayPhone) => {
    const digits = displayPhone.replace(/\D/g, '');

    if (digits.length === 0) return '';
    return '7' + digits;
  };

  // Validate operator code
  const isValidOperatorCode = (operatorCode) => {
    return KZ_OPERATOR_CODES.includes(operatorCode);
  };

  // Initialize display value from prop value
  useEffect(() => {
    if (value) {
      // Remove country code prefix (7) if coming from backend
      const cleanValue = value.startsWith('7') ? value.slice(1) : value;
      setDisplayValue(formatPhoneForDisplay(cleanValue));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e) => {
    const input = e.target.value;

    // Get cursor position before change
    const cursorPosition = e.target.selectionStart;

    // Remove the prefix "+7 (" and ")" to get just the input
    const withoutPrefix = input.replace(/^\+7\s*\(/, '').replace(/\)/, '');

    // Get just the digits
    const digits = withoutPrefix.replace(/\D/g, '');

    // Limit to 10 digits (local number)
    const limitedDigits = digits.slice(0, 10);

    // Format for display
    const formatted = formatPhoneForDisplay(limitedDigits);
    setDisplayValue(formatted);

    // Convert to backend format and pass to parent
    const backendFormat = formatPhoneForBackend(formatted);
    onChange({ target: { name: e.target.name || 'phone', value: backendFormat } });
  };

  const handleKeyDown = (e) => {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Allow Ctrl/Cmd + A, C, V, X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }

    // Only allow digits
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }

    // Prevent typing if already at max length (10 digits)
    const currentDigits = displayValue.replace(/\D/g, '');
    if (currentDigits.length >= 10 && /^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '');

    // Remove country code if present (single 7 at start, or if it's an 11-digit number starting with 7)
    let localDigits = digits;
    if (digits.length === 11 && digits.startsWith('7')) {
      localDigits = digits.slice(1);
    } else if (digits.length === 10) {
      localDigits = digits;
    } else if (digits.startsWith('7')) {
      localDigits = digits.slice(1);
    }

    const limitedDigits = localDigits.slice(0, 10);

    const formatted = formatPhoneForDisplay(limitedDigits);
    setDisplayValue(formatted);

    const backendFormat = formatPhoneForBackend(formatted);
    onChange({ target: { name: 'phone', value: backendFormat } });
  };

  const handleFocus = (e) => {
    // Move cursor to the end of existing digits
    setTimeout(() => {
      const input = e.target;
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }, 0);
  };

  // Get operator code from current value
  const getOperatorCode = () => {
    const digits = displayValue.replace(/\D/g, '');
    return digits.slice(0, 3);
  };

  // Check if operator code is valid
  const operatorCode = getOperatorCode();
  const hasInvalidOperatorCode = operatorCode.length === 3 && !isValidOperatorCode(operatorCode);

  // Get the formatted input value to display
  const getInputDisplayValue = () => {
    if (displayValue === '') {
      return '+7 (';
    }

    const digits = displayValue.replace(/\D/g, '');

    if (digits.length <= 3) {
      return `+7 (${displayValue}`;
    }

    // Format: +7 (707) 111 11 11
    let formatted = '+7 (';

    if (digits.length > 0) {
      formatted += digits.slice(0, 3);
    }

    if (digits.length > 3) {
      formatted += ') ' + digits.slice(3, 6);
    } else {
      formatted += ')';
    }

    if (digits.length > 6) {
      formatted += ' ' + digits.slice(6, 8);
    }

    if (digits.length > 8) {
      formatted += ' ' + digits.slice(8, 10);
    }

    return formatted;
  };

  // Check if phone number is complete (10 digits)
  const isComplete = displayValue.replace(/\D/g, '').length === 10;

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <input
        ref={inputRef}
        type="text"
        className={`input ${error || hasInvalidOperatorCode ? 'input-error' : ''}`}
        value={getInputDisplayValue()}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        placeholder="+7 (___) ___ __ __"
        disabled={disabled}
        name="phone"
      />

      {hasInvalidOperatorCode && (
        <span className="input-error-message">
          {t('validation.invalidOperatorCode')}
        </span>
      )}

      {error && !hasInvalidOperatorCode && (
        <span className="input-error-message">{error}</span>
      )}

      {!error && !hasInvalidOperatorCode && displayValue && !isComplete && (
        <span className="input-hint">
          {t('validation.phoneIncomplete')}
        </span>
      )}

      {!error && !hasInvalidOperatorCode && isComplete && (
        <span className="input-hint input-hint-success">
          ✓ {t('validation.phoneComplete')}
        </span>
      )}
    </div>
  );
};

export default PhoneInput;
