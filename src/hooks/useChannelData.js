import { useState, useCallback } from 'react';

const YOUTUBE_CHANNELS_API = 'https://www.googleapis.com/youtube/v3/channels';
const CHANNEL_CACHE_KEY = 'youtube_channel_cache';

// 채널 캐시 (메모리 + localStorage)
let channelCache = {};

// localStorage에서 캐시 로드
try {
  const stored = localStorage.getItem(CHANNEL_CACHE_KEY);
  if (stored) {
    channelCache = JSON.parse(stored);
  }
} catch (e) {
  channelCache = {};
}

// 캐시 저장
function saveCache() {
  try {
    localStorage.setItem(CHANNEL_CACHE_KEY, JSON.stringify(channelCache));
  } catch (e) {
    // 용량 초과 시 캐시 클리어
    channelCache = {};
  }
}

/**
 * 단일 채널 정보 가져오기
 */
export async function fetchSingleChannelData(channelId, apiKey) {
  // 캐시 확인
  if (channelCache[channelId]) {
    return channelCache[channelId];
  }

  try {
    const params = new URLSearchParams({
      part: 'statistics',
      id: channelId,
      key: apiKey,
    });

    const response = await fetch(`${YOUTUBE_CHANNELS_API}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || !data.items || data.items.length === 0) {
      return null;
    }

    const channel = data.items[0];
    const channelData = {
      subscriberCount: channel.statistics?.subscriberCount,
      hiddenSubscriberCount: channel.statistics?.hiddenSubscriberCount,
      videoCount: channel.statistics?.videoCount,
    };

    // 캐시에 저장
    channelCache[channelId] = channelData;
    saveCache();

    return channelData;
  } catch (err) {
    console.warn('Failed to fetch channel data:', err);
    return null;
  }
}

/**
 * 채널 데이터 훅 - 온디맨드 로딩
 */
export function useChannelData(apiKey) {
  const [loadingChannels, setLoadingChannels] = useState({});
  const [channelData, setChannelData] = useState({});

  const loadChannelData = useCallback(async (channelId) => {
    // 이미 로드된 경우
    if (channelData[channelId]) {
      return channelData[channelId];
    }

    // 캐시 확인
    if (channelCache[channelId]) {
      setChannelData((prev) => ({ ...prev, [channelId]: channelCache[channelId] }));
      return channelCache[channelId];
    }

    // 이미 로딩 중인 경우
    if (loadingChannels[channelId]) {
      return null;
    }

    setLoadingChannels((prev) => ({ ...prev, [channelId]: true }));

    const data = await fetchSingleChannelData(channelId, apiKey);

    setLoadingChannels((prev) => ({ ...prev, [channelId]: false }));

    if (data) {
      setChannelData((prev) => ({ ...prev, [channelId]: data }));
    }

    return data;
  }, [apiKey, channelData, loadingChannels]);

  const isLoading = useCallback((channelId) => {
    return !!loadingChannels[channelId];
  }, [loadingChannels]);

  const getChannelData = useCallback((channelId) => {
    return channelData[channelId] || channelCache[channelId] || null;
  }, [channelData]);

  // 여러 채널 한 번에 로드
  const loadAllChannelData = useCallback(async (channelIds) => {
    const idsToLoad = channelIds.filter(
      (id) => !channelData[id] && !channelCache[id] && !loadingChannels[id]
    );

    if (idsToLoad.length === 0) return;

    // 로딩 상태 설정
    setLoadingChannels((prev) => {
      const next = { ...prev };
      idsToLoad.forEach((id) => (next[id] = true));
      return next;
    });

    // 병렬로 로드
    const results = await Promise.all(
      idsToLoad.map((id) => fetchSingleChannelData(id, apiKey))
    );

    // 결과 저장
    setLoadingChannels((prev) => {
      const next = { ...prev };
      idsToLoad.forEach((id) => (next[id] = false));
      return next;
    });

    setChannelData((prev) => {
      const next = { ...prev };
      idsToLoad.forEach((id, index) => {
        if (results[index]) {
          next[id] = results[index];
        }
      });
      return next;
    });
  }, [apiKey, channelData, loadingChannels]);

  // 모든 채널 데이터가 로드되었는지 확인
  const hasAllChannelData = useCallback((channelIds) => {
    return channelIds.every((id) => channelData[id] || channelCache[id]);
  }, [channelData]);

  // 로딩 중인 채널이 있는지 확인
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingChannels).some((v) => v);
  }, [loadingChannels]);

  return {
    loadChannelData,
    loadAllChannelData,
    isLoading,
    isAnyLoading,
    getChannelData,
    hasAllChannelData,
  };
}
