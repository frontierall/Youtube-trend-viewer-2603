import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'youtube_favorites';

/**
 * 즐겨찾기 관리 커스텀 훅
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // localStorage에 저장
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // 즐겨찾기 추가
  const addFavorite = useCallback((video) => {
    setFavorites((prev) => {
      if (prev.some((v) => v.id === video.id)) {
        return prev; // 이미 존재
      }
      return [...prev, {
        id: video.id,
        title: video.snippet?.title,
        channelTitle: video.snippet?.channelTitle,
        thumbnail: video.snippet?.thumbnails?.medium?.url,
        addedAt: new Date().toISOString(),
      }];
    });
  }, []);

  // 즐겨찾기 제거
  const removeFavorite = useCallback((videoId) => {
    setFavorites((prev) => prev.filter((v) => v.id !== videoId));
  }, []);

  // 즐겨찾기 여부 확인
  const isFavorite = useCallback((videoId) => {
    return favorites.some((v) => v.id === videoId);
  }, [favorites]);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((video) => {
    if (isFavorite(video.id)) {
      removeFavorite(video.id);
    } else {
      addFavorite(video);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites: () => setFavorites([]),
  };
}
