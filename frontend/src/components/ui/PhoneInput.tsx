import React from 'react';
import { formatPHMobile, extractPHMobileDigits } from '../../utils/phoneFormatter';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, error, label, required, helperText, className = '', id, disabled, ...props }, ref) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatPHMobile(raw);
      if (onChange) {
        onChange(formatted);
      }
    };

    // Calculate how many digits entered out of 10
    const digitsCount = extractPHMobileDigits(value).length;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none text-xs font-bold text-slate-500 dark:text-slate-400 select-none">
            <span role="img" aria-label="Philippines Flag" className="text-sm">
              🇵🇭
            </span>
          </div>

          <input
            ref={ref}
            id={id}
            type="tel"
            disabled={disabled}
            value={value}
            onChange={handleInputChange}
            placeholder="+63 917 123 4567"
            maxLength={17} // "+63 9XX XXX XXXX" is exactly 16-17 chars
            className={`w-full pl-10 pr-14 py-2.5 rounded-xl text-xs font-medium outline-none transition-all border ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/20'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''} ${className}`}
            {...props}
          />

          <div className="absolute right-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 pointer-events-none select-none">
            {digitsCount}/10
          </div>
        </div>

        {error ? (
          <p className="text-red-500 text-[11px] font-semibold mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-slate-400 text-[10px] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
