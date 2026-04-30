import { useEffect, useState } from 'react';

export function KeywordSearchBar({ initialValue = '', onSearch, disabled = false }) {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || disabled) return;
    onSearch(trimmed);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-3">
      <div className="flex-1">
        <label
          htmlFor="keyword-search"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          키워드 검색
        </label>
        <input
          id="keyword-search"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="예: 아이브, 챗GPT, 롤 하이라이트"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          disabled={!inputValue.trim() || disabled}
          className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          검색
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled && !inputValue}
          className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          초기화
        </button>
      </div>
    </form>
  );
}
