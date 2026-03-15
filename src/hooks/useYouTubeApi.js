import { useState, useEffect, useCallback } from 'react';

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

  const fetchVideos = useCallback(async () => {
    if (!apiKey) {
      setError('API 키를 입력해주세요.');
      setVideos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics',
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
        const errorMessage = data.error?.message || '동영상을 불러오는데 실패했습니다.';
        throw new Error(errorMessage);
      }

      setVideos(data.items || []);
    } catch (err) {
      setError(err.message);
      setVideos([]);
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
    refetch: fetchVideos,
  };
}
