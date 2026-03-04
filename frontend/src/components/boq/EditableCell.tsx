import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  align?: 'left' | 'right' | 'center';
  className?: string;
  placeholder?: string;
  selectOnFocus?: boolean;
  disabled?: boolean;
}

export function EditableCell({
  value,
  onChange,
  type = 'text',
  align = 'left',
  className,
  placeholder,
  selectOnFocus = true,
  disabled = false,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (selectOnFocus) inputRef.current.select();
    }
  }, [editing, selectOnFocus]);

  const commit = () => {
    setEditing(false);
    if (draft !== String(value)) {
      onChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(String(value));
      setEditing(false);
    }
    if (e.key === 'Tab') commit();
  };

  if (disabled) {
    return (
      <div
        className={cn(
          'px-2 py-1.5 text-sm text-slate-400 truncate',
          align === 'right' && 'text-right font-financial',
          className,
        )}
      >
        {type === 'number' ? Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
      </div>
    );
  }

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className={cn(
          'px-2 py-1.5 text-sm cursor-text truncate rounded hover:bg-amber-50 transition-colors min-h-[32px]',
          align === 'right' && 'text-right font-financial',
          !value && value !== 0 && 'text-slate-400 italic',
          className,
        )}
      >
        {type === 'number' && value !== '' && value !== 0
          ? Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : value || placeholder || '\u00A0'}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type === 'number' ? 'number' : 'text'}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      step={type === 'number' ? 'any' : undefined}
      className={cn(
        'w-full px-2 py-1 text-sm border border-amber-400 rounded bg-white outline-none ring-2 ring-amber-400/20',
        align === 'right' && 'text-right font-financial',
        className,
      )}
    />
  );
}
