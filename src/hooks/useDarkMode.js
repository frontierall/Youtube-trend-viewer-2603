import { useState, useEffect } from 'react';

const DARK_MODE_KEY = 'youtube_dark_mode';

/**
 * 다크 모드 관리 커스텀 훅
 */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    // 시스템 설정 확인
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());

    // HTML 요소에 dark 클래스 추가/제거
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode: setIsDarkMode,
  };
}
