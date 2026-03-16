import { useMemo, useState } from 'react';
import { formatCount } from '../utils/formatViewCount';
import { CATEGORIES } from '../utils/constants';

export function StatsDashboard({ videos, isOpen, onClose, inline = false }) {
  const [sortBy, setSortBy] = useState('avgViews');

  const stats = useMemo(() => {
    if (!videos || videos.length === 0) {
      return null;
    }

    const totalViews = videos.reduce(
      (sum, v) => sum + parseInt(v.statistics?.viewCount || 0),
      0
    );
    const totalLikes = videos.reduce(
      (sum, v) => sum + parseInt(v.statistics?.likeCount || 0),
      0
    );
    const totalComments = videos.reduce(
      (sum, v) => sum + parseInt(v.statistics?.commentCount || 0),
      0
    );

    const avgViews = Math.round(totalViews / videos.length);
    const avgLikes = Math.round(totalLikes / videos.length);
    const avgComments = Math.round(totalComments / videos.length);

    // 가장 많은 조회수
    const topViewed = [...videos].sort(
      (a, b) =>
        parseInt(b.statistics?.viewCount || 0) -
        parseInt(a.statistics?.viewCount || 0)
    )[0];

    // 가장 많은 좋아요
    const topLiked = [...videos].sort(
      (a, b) =>
        parseInt(b.statistics?.likeCount || 0) -
        parseInt(a.statistics?.likeCount || 0)
    )[0];

    // HD 비율
    const hdCount = videos.filter(
      (v) => v.contentDetails?.definition === 'hd'
    ).length;
    const hdPercentage = Math.round((hdCount / videos.length) * 100);

    // 카테고리별 통계
    const categoryMap = {};
    videos.forEach((v) => {
      const id = v.snippet?.categoryId;
      if (!id) return;
      if (!categoryMap[id]) categoryMap[id] = { views: 0, likes: 0, comments: 0, count: 0 };
      categoryMap[id].views    += parseInt(v.statistics?.viewCount || 0);
      categoryMap[id].likes    += parseInt(v.statistics?.likeCount || 0);
      categoryMap[id].comments += parseInt(v.statistics?.commentCount || 0);
      categoryMap[id].count    += 1;
    });

    const categoryStats = Object.entries(categoryMap).map(([id, d]) => ({
      id,
      name: CATEGORIES.find(c => c.id === id)?.name || `카테고리 ${id}`,
      count: d.count,
      avgViews:    Math.round(d.views    / d.count),
      avgLikes:    Math.round(d.likes    / d.count),
      avgComments: Math.round(d.comments / d.count),
    }));

    return {
      totalVideos: videos.length,
      totalViews,
      totalLikes,
      totalComments,
      avgViews,
      avgLikes,
      avgComments,
      topViewed,
      topLiked,
      hdPercentage,
      hdCount,
      categoryStats,
    };
  }, [videos]);

  if (!inline && !isOpen) return null;

  const content = stats ? (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="총 동영상" value={stats.totalVideos} icon="📺" />
        <StatCard label="총 조회수" value={formatCount(stats.totalViews)} icon="👁" />
        <StatCard label="총 좋아요" value={formatCount(stats.totalLikes)} icon="👍" />
        <StatCard label="HD 비율" value={`${stats.hdPercentage}%`} icon="🎬" />
      </div>

      {/* 평균 통계 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">평균 통계</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="평균 조회수" value={formatCount(stats.avgViews)} small />
          <StatCard label="평균 좋아요" value={formatCount(stats.avgLikes)} small />
          <StatCard label="평균 댓글" value={formatCount(stats.avgComments)} small />
        </div>
      </div>

      {/* Top 동영상 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top 동영상</h3>
        <div className="space-y-3">
          {stats.topViewed && (
            <TopVideoCard
              label="최다 조회"
              video={stats.topViewed}
              statValue={formatCount(stats.topViewed.statistics?.viewCount)}
              statLabel="조회수"
            />
          )}
          {stats.topLiked && (
            <TopVideoCard
              label="최다 좋아요"
              video={stats.topLiked}
              statValue={formatCount(stats.topLiked.statistics?.likeCount)}
              statLabel="좋아요"
            />
          )}
        </div>
      </div>

      {/* 카테고리별 비교 */}
      {stats.categoryStats.length > 1 && (
        <CategoryComparison
          categoryStats={stats.categoryStats}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}
    </div>
  ) : (
    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
      통계를 계산할 동영상이 없습니다.
    </div>
  );

  if (inline) {
    return <div className="max-w-2xl mx-auto">{content}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">통계 대시보드</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{content}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, small }) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg ${small ? 'p-3' : 'p-4'}`}>
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <div className={`font-bold text-gray-900 dark:text-white ${small ? 'text-lg' : 'text-2xl'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function CategoryComparison({ categoryStats, sortBy, onSortChange }) {
  const sorted = [...categoryStats].sort((a, b) => b[sortBy] - a[sortBy]);
  const maxValue = sorted[0]?.[sortBy] || 1;

  const buttons = [
    { key: 'avgViews', label: '평균 조회수' },
    { key: 'avgLikes', label: '평균 좋아요' },
    { key: 'count',    label: '영상 수' },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">카테고리별 비교</h3>

      {/* 정렬 버튼 */}
      <div className="flex gap-2 mb-4">
        {buttons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSortChange(key)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              sortBy === key
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 막대 바 목록 */}
      <div className="space-y-3">
        {sorted.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3">
            <span className="text-xs text-gray-700 dark:text-gray-300 w-28 shrink-0 truncate">
              {cat.name}
              <span className="text-gray-400 dark:text-gray-500 ml-1">({cat.count})</span>
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(cat[sortBy] / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-20 text-right shrink-0">
              {sortBy === 'count' ? cat[sortBy] : formatCount(cat[sortBy])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopVideoCard({ label, video, statValue, statLabel }) {
  const thumbnail = video.snippet?.thumbnails?.medium?.url;
  const title = video.snippet?.title;
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-16">{label}</span>
      <img
        src={thumbnail}
        alt={title}
        className="w-16 h-10 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600 truncate block"
        >
          {title}
        </a>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {statLabel}: {statValue}
        </span>
      </div>
    </div>
  );
}
