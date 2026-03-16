import { useState, useCallback } from 'react';

const API_BASE = 'https://www.googleapis.com/youtube/v3';

function parseChannelInput(input) {
  input = input.trim();

  try {
    const url = new URL(input);
    const channelMatch = url.pathname.match(/\/channel\/(UC[\w-]+)/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    const handleMatch = url.pathname.match(/\/@([\w.-]+)/);
    if (handleMatch) return { type: 'handle', value: handleMatch[1] };

    const nameMatch = url.pathname.match(/\/(?:c|user)\/([\w.-]+)/);
    if (nameMatch) return { type: 'username', value: nameMatch[1] };
  } catch (e) {
    // URL이 아닌 경우
  }

  if (input.startsWith('UC') && input.length > 10) {
    return { type: 'id', value: input };
  }

  if (input.startsWith('@')) {
    return { type: 'handle', value: input.slice(1) };
  }

  return { type: 'handle', value: input };
}

export function useChannelAnalysis(apiKey) {
  const [channelInfo, setChannelInfo] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeChannel = useCallback(async (input) => {
    if (!apiKey || !input.trim()) return;

    setLoading(true);
    setError(null);
    setChannelInfo(null);
    setRecentVideos([]);

    try {
      const parsed = parseChannelInput(input);

      // 1. 채널 기본 정보 + 업로드 플레이리스트 ID 조회
      const channelParams = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        key: apiKey,
      });

      if (parsed.type === 'id') {
        channelParams.append('id', parsed.value);
      } else if (parsed.type === 'handle') {
        channelParams.append('forHandle', parsed.value);
      } else {
        channelParams.append('forUsername', parsed.value);
      }

      const channelRes = await fetch(`${API_BASE}/channels?${channelParams}`);
      const channelData = await channelRes.json();

      if (!channelRes.ok) {
        throw new Error(channelData.error?.message || '채널 정보를 불러오는데 실패했습니다.');
      }

      if (!channelData.items || channelData.items.length === 0) {
        throw new Error('채널을 찾을 수 없습니다. 채널 ID, @핸들 또는 URL을 확인해주세요.');
      }

      const channel = channelData.items[0];
      setChannelInfo(channel);

      // 2. 업로드 플레이리스트에서 최근 영상 ID 조회
      const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) return;

      const playlistParams = new URLSearchParams({
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: '20',
        key: apiKey,
      });

      const playlistRes = await fetch(`${API_BASE}/playlistItems?${playlistParams}`);
      const playlistData = await playlistRes.json();

      if (!playlistRes.ok || !playlistData.items) return;

      const videoIds = playlistData.items
        .map((item) => item.snippet?.resourceId?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) return;

      // 3. 영상 상세 정보 조회
      const videosParams = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
        key: apiKey,
      });

      const videosRes = await fetch(`${API_BASE}/videos?${videosParams}`);
      const videosData = await videosRes.json();

      if (videosRes.ok && videosData.items) {
        setRecentVideos(videosData.items);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  return { channelInfo, recentVideos, loading, error, analyzeChannel };
}
