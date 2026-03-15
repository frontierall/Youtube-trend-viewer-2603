import { useState } from 'react';
import { STORAGE_KEY } from '../utils/constants';

export function ApiKeyInput({ apiKey, onApiKeyChange }) {
  const [inputValue, setInputValue] = useState(apiKey);
  const [isEditing, setIsEditing] = useState(!apiKey);

  const handleSave = () => {
    const trimmedKey = inputValue.trim();
    if (trimmedKey) {
      localStorage.setItem(STORAGE_KEY, trimmedKey);
      onApiKeyChange(trimmedKey);
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInputValue('');
    onApiKeyChange('');
    setIsEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isEditing && apiKey) {
    return (
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
        <span className="text-sm text-gray-600">API 키: </span>
        <span className="text-sm font-mono text-gray-800">
          {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="ml-2 text-sm text-blue-600 hover:text-blue-800"
        >
          수정
        </button>
        <button
          onClick={handleClear}
          className="text-sm text-red-600 hover:text-red-800"
        >
          삭제
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="password"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="YouTube API 키를 입력하세요"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      />
      <button
        onClick={handleSave}
        disabled={!inputValue.trim()}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        저장
      </button>
      {apiKey && (
        <button
          onClick={() => {
            setInputValue(apiKey);
            setIsEditing(false);
          }}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          취소
        </button>
      )}
    </div>
  );
}
