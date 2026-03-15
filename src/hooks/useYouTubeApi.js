import { useState, useEffect, useCallback } from 'react';
import { getCache, setCache, getCacheKey } from './useCache';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3/videos';

/**
 * YouTube API를 사용하여 인기 동영상을 가져오는 커스텀 훅
 * @param {string} apiKey - YouTube Data API 키
 * @param {string} regionCode - 국가 코드 (예: 'KR', 'US')
 * @param {string} categoryId - 카테고리 ID (예: '10' for Music, '0' for all)
 */
export function useYouTubeApi(apiKey, regionCode = 'KR', categoryId = '0') {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchVideos = useCallback(async (forceRefresh = false) => {
    if (!apiKey) {
      setVideos([]);
      return;
    }

    const cacheKey = getCacheKey(regionCode, categoryId);

    // 캐시 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        setVideos(cached);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setFromCache(false);

    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: regionCode,
        maxResults: '50',
        key: apiKey,
      });

      // 카테고리가 '0'(전체)이 아닌 경우에만 카테고리 필터 추가
      if (categoryId && categoryId !== '0') {
        params.append('videoCategoryId', categoryId);
      }

      const response = await fetch(`${YOUTUBE_API_BASE}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        // 카테고리에 동영상이 없는 경우 (404 등) 빈 배열로 처리
        if (response.status === 404 || data.error?.code === 404) {
          setVideos([]);
          return;
        }
        const errorMessage = data.error?.message || '동영상을 불러오는데 실패했습니다.';
        throw new Error(errorMessage);
      }

      const items = data.items || [];
      setVideos(items);

      // 캐시 저장
      if (items.length > 0) {
        setCache(cacheKey, items);
      }
    } catch (err) {
      // "videoChartNotFound" 등 카테고리 관련 에러는 빈 결과로 처리
      if (err.message?.includes('videoChart') || err.message?.includes('video category')) {
        setVideos([]);
        setError(null);
      } else {
        setError(err.message);
        setVideos([]);
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey, regionCode, categoryId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    loading,
    error,
    fromCache,
    refetch: () => fetchVideos(false),
    forceRefetch: () => fetchVideos(true),
  };
}
