import React, { useRef, useState, useEffect } from 'react';

export default function OTPInput({ length = 6, value = '', onChange, onComplete, disabled = false, error = false }) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (value) {
      const arr = value.split('').slice(0, length);
      while (arr.length < length) arr.push('');
      setDigits(arr);
    } else {
      setDigits(Array(length).fill(''));
    }
  }, [value, length]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    // Take the last character typed
    newDigits[index] = val ? val.slice(-1) : '';
    setDigits(newDigits);

    const otpStr = newDigits.join('');
    if (onChange) onChange(otpStr);

    // Auto advance focus
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (otpStr.length === length && onComplete && !newDigits.includes('')) {
      onComplete(otpStr);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pasted)) return;

    const pastedChars = pasted.slice(0, length).split('');
    const newDigits = [...digits];
    for (let i = 0; i < length; i++) {
      newDigits[i] = pastedChars[i] || '';
    }
    setDigits(newDigits);

    const otpStr = newDigits.join('');
    if (onChange) onChange(otpStr);
    if (otpStr.length === length && onComplete) {
      onComplete(otpStr);
    }
    // Focus last filled or next empty
    const nextEmpty = newDigits.findIndex(d => !d);
    if (nextEmpty !== -1) {
      inputsRef.current[nextEmpty]?.focus();
    } else {
      inputsRef.current[length - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-white transition duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400
            ${error
              ? 'border-rose-300 text-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 text-slate-900 focus:border-farm-600 focus:ring-farm-600/20 shadow-sm'
            }
          `}
        />
      ))}
    </div>
  );
}
