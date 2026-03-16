import { useState, useRef } from 'react';
import { formatViewCount, formatRelativeTime, formatCount, formatDuration } from '../utils/formatViewCount';

export function VideoCard({ video, rank, isFavorite, onToggleFavorite, loadChannelData, isChannelLoading, getChannelData }) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const hoverTimeout = useRef(null);
  const { snippet, statistics, contentDetails } = video;

  // 채널 데이터 (온디맨드 로딩)
  const channelData = getChannelData?.(snippet.channelId);
  const channelLoading = isChannelLoading?.(snippet.channelId);

  const handleLoadSubscribers = () => {
    if (loadChannelData && !channelData && !channelLoading) {
      loadChannelData(snippet.channelId);
    }
  };
  const thumbnailUrl = snippet.thumbnails?.maxres?.url
    || snippet.thumbnails?.high?.url
    || snippet.thumbnails?.medium?.url
    || snippet.thumbnails?.default?.url;

  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
  const channelUrl = `https://www.youtube.com/channel/${snippet.channelId}`;
  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1`;

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setShowPreview(true);
    }, 800); // 0.8초 후 미리보기 시작
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setShowPreview(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500';
    if (rank === 2) return 'bg-gray-400';
    if (rank === 3) return 'bg-amber-600';
    return 'bg-gray-700';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow group">
      {/* 썸네일 */}
      <div
        className="relative aspect-video overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showPreview ? (
          <iframe
            src={embedUrl}
            title={snippet.title}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >
            <img
              src={thumbnailUrl}
              alt={snippet.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* 재생 아이콘 (호버 시 표시) */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </a>
        )}
        {/* 순위 배지 */}
        <div className={`absolute top-2 left-2 ${getRankBadgeColor(rank)} text-white text-sm font-bold px-2 py-1 rounded z-10`}>
          #{rank}
        </div>
        {/* 영상 길이 */}
        {!showPreview && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(contentDetails?.duration)}
          </div>
        )}
        {/* HD 배지 */}
        {contentDetails?.definition === 'hd' && !showPreview && (
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            HD
          </div>
        )}
      </div>

      {/* 컨텐츠 */}
      <div className="p-4">
        {/* 제목 + 즐겨찾기 */}
        <div className="flex items-start gap-2">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block flex-1"
          >
            <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors dark:text-white">
              {snippet.title}
            </h3>
          </a>
          {/* URL 복사 버튼 */}
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
            title={copied ? '복사됨!' : 'URL 복사'}
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {/* 즐겨찾기 버튼 */}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(video)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
              title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              <svg
                className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* 채널명 + 구독자 수 */}
        <div className="mt-2 flex items-center gap-2">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            {snippet.channelTitle}
          </a>
          {/* 구독자 수: 온디맨드 로딩 */}
          {channelData && !channelData.hiddenSubscriberCount && channelData.subscriberCount ? (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              구독자 {formatCount(channelData.subscriberCount)}명
            </span>
          ) : channelLoading ? (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로딩...
            </span>
          ) : loadChannelData ? (
            <button
              onClick={handleLoadSubscribers}
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="구독자 수 보기"
            >
              구독자 보기
            </button>
          ) : null}
        </div>

        {/* 조회수 및 게시일 */}
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatViewCount(statistics?.viewCount || 0)}</span>
          <span className="mx-1">•</span>
          <span>{formatRelativeTime(snippet.publishedAt)}</span>
        </div>

        {/* 좋아요 및 댓글 수 */}
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {/* 좋아요 */}
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {formatCount(statistics?.likeCount || 0)}
          </span>
          {/* 댓글 */}
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {formatCount(statistics?.commentCount || 0)}
          </span>
          {/* 자막 */}
          {contentDetails?.caption === 'true' && (
            <span className="flex items-center gap-1" title="자막 있음">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              CC
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
