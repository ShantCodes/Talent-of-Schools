
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

type SearchInputProps = {
  onSearch: (value: string) => void;
  placeholder?: string;
  debounce?: number;
  className?: string;
};

export function SearchInput({
  onSearch,
  placeholder = 'Search...',
  debounce = 400,
  className = '',
}: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value.trim());
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onSearch]);

  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
      />

      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-9 text-sm outline-none focus:border-primary"
      />

      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
