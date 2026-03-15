import { formatViewCount, formatRelativeTime } from '../utils/formatViewCount';

export function VideoCard({ video, rank }) {
  const { snippet, statistics } = video;
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
      </div>
    </div>
  );
}
