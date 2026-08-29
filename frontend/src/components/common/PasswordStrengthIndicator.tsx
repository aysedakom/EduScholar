// frontend/src/components/common/PasswordStrengthIndicator.tsx
import React from 'react';
import { Check, ShieldAlert, ShieldCheck } from 'lucide-react';
import { validateStandardPassword, type PasswordRuleResult } from '../../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  userContext?: { name?: string; email?: string };
  showChecklist?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  userContext,
  showChecklist = true,
}) => {
  if (!password) return null;

  const result: PasswordRuleResult = validateStandardPassword(password, userContext);

  const getMeterColor = () => {
    switch (result.strengthLabel) {
      case 'Too Weak':
      case 'Weak':
        return 'bg-rose-500';
      case 'Fair':
        return 'bg-amber-500';
      case 'Strong':
        return 'bg-blue-600';
      case 'Very Strong':
        return 'bg-emerald-600';
      default:
        return 'bg-slate-300';
    }
  };

  const getMeterWidth = () => {
    switch (result.score) {
      case 0:
        return 'w-1/12';
      case 1:
        return 'w-1/4';
      case 2:
        return 'w-2/4';
      case 3:
        return 'w-3/4';
      case 4:
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  const checklist = [
    {
      label: 'Length: 12–16 characters recommended (min 12)',
      satisfied: result.hasMinLength,
    },
    {
      label: 'At least one uppercase letter (A–Z)',
      satisfied: result.hasUppercase,
    },
    {
      label: 'At least one lowercase letter (a–z)',
      satisfied: result.hasLowercase,
    },
    {
      label: 'At least one numeric digit (0–9)',
      satisfied: result.hasNumber,
    },
    {
      label: 'At least one special symbol (!@#$%^&*)',
      satisfied: result.hasSpecialChar,
    },
    {
      label: 'Avoid common phrases, dictionary words & name',
      satisfied: result.isNotCommonPhrase && result.doesNotContainUserInfo,
    },
  ];

  return (
    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs animate-in fade-in">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            {result.isValid ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            )}
            Standard Password Strength:
          </span>
          <span
            className={`font-extrabold ${
              result.strengthLabel === 'Very Strong'
                ? 'text-emerald-600 dark:text-emerald-400'
                : result.strengthLabel === 'Strong'
                ? 'text-blue-600 dark:text-blue-400'
                : result.strengthLabel === 'Fair'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {result.strengthLabel}
          </span>
        </div>

        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getMeterColor()} ${getMeterWidth()} transition-all duration-300 rounded-full`}
          />
        </div>
      </div>

      {/* Checklist */}
      {showChecklist && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 font-medium transition-colors ${
                item.satisfied
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.satisfied ? (
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              ) : (
                <div className="h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                </div>
              )}
              <span className={item.satisfied ? 'font-bold' : ''}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
