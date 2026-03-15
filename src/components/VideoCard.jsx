import { formatViewCount, formatRelativeTime, formatCount, formatDuration } from '../utils/formatViewCount';

export function VideoCard({ video, rank }) {
  const { snippet, statistics, contentDetails } = video;
  const thumbnailUrl = snippet.thumbnails?.maxres?.url
    || snippet.thumbnails?.high?.url
    || snippet.thumbnails?.medium?.url
    || snippet.thumbnails?.default?.url;

  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
  const channelUrl = `https://www.youtube.com/channel/${snippet.channelId}`;

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500';
    if (rank === 2) return 'bg-gray-400';
    if (rank === 3) return 'bg-amber-600';
    return 'bg-gray-700';
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow group">
      {/* 썸네일 */}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video overflow-hidden"
      >
        <img
          src={thumbnailUrl}
          alt={snippet.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* 순위 배지 */}
        <div className={`absolute top-2 left-2 ${getRankBadgeColor(rank)} text-white text-sm font-bold px-2 py-1 rounded`}>
          #{rank}
        </div>
        {/* 영상 길이 */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {formatDuration(contentDetails?.duration)}
        </div>
        {/* HD 배지 */}
        {contentDetails?.definition === 'hd' && (
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            HD
          </div>
        )}
      </a>

      {/* 컨텐츠 */}
      <div className="p-4">
        {/* 제목 */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
            {snippet.title}
          </h3>
        </a>

        {/* 채널명 */}
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {snippet.channelTitle}
        </a>

        {/* 조회수 및 게시일 */}
        <div className="mt-2 text-sm text-gray-500">
          <span>{formatViewCount(statistics?.viewCount || 0)}</span>
          <span className="mx-1">•</span>
          <span>{formatRelativeTime(snippet.publishedAt)}</span>
        </div>

        {/* 좋아요 및 댓글 수 */}
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
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
