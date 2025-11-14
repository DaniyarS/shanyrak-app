import { useState, useRef, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ length = 4, value = '', onChange, error, disabled = false }) => {
  const [otp, setOtp] = useState(value.split('').slice(0, length));
  const inputRefs = useRef([]);

  useEffect(() => {
    setOtp(value.split('').slice(0, length));
  }, [value, length]);

  const handleChange = (index, inputValue) => {
    // Only allow digits
    if (!/^\d*$/.test(inputValue)) return;

    const newOtp = [...otp];
    newOtp[index] = inputValue.slice(-1); // Take only the last character
    setOtp(newOtp);

    // Call onChange with the full OTP value
    onChange(newOtp.join(''));

    // Move to next input if current is filled
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);

    // Only allow digits
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < length) {
      newOtp.push('');
    }
    setOtp(newOtp);
    onChange(pastedData);

    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="otp-input-wrapper">
      <div className={`otp-input-container ${error ? 'has-error' : ''}`}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="otp-input-box"
            disabled={disabled}
            autoComplete="off"
          />
        ))}
      </div>
      {error && <span className="otp-input-error">{error}</span>}
    </div>
  );
};

export default OtpInput;
