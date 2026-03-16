import { useState } from 'react';
import { useChannelAnalysis } from '../hooks/useChannelAnalysis';
import { formatCount } from '../utils/formatViewCount';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

function formatDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function calcAvgStats(videos) {
  if (videos.length === 0) return null;

  const total = videos.reduce(
    (acc, v) => ({
      views: acc.views + parseInt(v.statistics?.viewCount || 0),
      likes: acc.likes + parseInt(v.statistics?.likeCount || 0),
      comments: acc.comments + parseInt(v.statistics?.commentCount || 0),
    }),
    { views: 0, likes: 0, comments: 0 }
  );
  const n = videos.length;

  let avgDays = null;
  if (videos.length >= 2) {
    const dates = videos
      .map((v) => new Date(v.snippet?.publishedAt))
      .sort((a, b) => b - a);
    const totalDays = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
    avgDays = Math.round(totalDays / (dates.length - 1));
  }

  return {
    avgViews: Math.round(total.views / n),
    avgLikes: Math.round(total.likes / n),
    avgComments: Math.round(total.comments / n),
    avgDays,
  };
}

export function ChannelAnalysis({ apiKey }) {
  const [input, setInput] = useState('');
  const { channelInfo, recentVideos, loading, error, analyzeChannel } = useChannelAnalysis(apiKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeChannel(input);
  };

  const avgStats = calcAvgStats(recentVideos);

  return (
    <div>
      {/* 검색 폼 */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="채널 ID, @핸들 또는 채널 URL 입력 (예: @MrBeast, UCxxxxxx)"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={loading || !apiKey || !input.trim()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '분석 중...' : '분석'}
        </button>
      </form>

      {/* API 키 없음 */}
      {!apiKey && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">🔑</div>
          <p className="text-gray-600 dark:text-gray-400">API 키를 먼저 입력해주세요.</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">채널 분석 중...</p>
        </div>
      )}

      {/* 채널 분석 결과 */}
      {channelInfo && !loading && (
        <div className="space-y-6">
          {/* 채널 헤더 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex gap-5 shadow-sm">
            <img
              src={channelInfo.snippet?.thumbnails?.medium?.url}
              alt={channelInfo.snippet?.title}
              className="w-20 h-20 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {channelInfo.snippet?.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                개설일: {formatDate(channelInfo.snippet?.publishedAt)}
              </p>
              {channelInfo.snippet?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {channelInfo.snippet.description}
                </p>
              )}
            </div>
          </div>

          {/* 채널 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon="👥"
              label="구독자"
              value={
                channelInfo.statistics?.hiddenSubscriberCount
                  ? '비공개'
                  : formatCount(channelInfo.statistics?.subscriberCount)
              }
            />
            <StatCard
              icon="👁"
              label="총 조회수"
              value={formatCount(channelInfo.statistics?.viewCount)}
            />
            <StatCard
              icon="📹"
              label="총 영상 수"
              value={formatCount(channelInfo.statistics?.videoCount)}
            />
          </div>

          {/* 최근 영상 평균 통계 */}
          {avgStats && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                최근 {recentVideos.length}개 영상 평균
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="평균 조회수" value={formatCount(avgStats.avgViews)} small />
                <StatCard label="평균 좋아요" value={formatCount(avgStats.avgLikes)} small />
                <StatCard label="평균 댓글" value={formatCount(avgStats.avgComments)} small />
                <StatCard
                  label="평균 업로드 주기"
                  value={avgStats.avgDays !== null ? `${avgStats.avgDays}일` : '-'}
                  small
                />
              </div>
            </div>
          )}

          {/* 최근 업로드 영상 목록 */}
          {recentVideos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                최근 업로드 영상
              </h3>
              <div className="space-y-2">
                {recentVideos.map((video, i) => (
                  <VideoRow key={video.id} video={video} rank={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 초기 안내 */}
      {!channelInfo && !loading && !error && apiKey && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-400">채널 ID, @핸들 또는 URL을 입력하세요</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            예: @MrBeast &nbsp;|&nbsp; UCxxxxxx &nbsp;|&nbsp; https://youtube.com/@채널명
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, small }) {
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

function VideoRow({ video, rank }) {
  const thumbnail = video.snippet?.thumbnails?.default?.url;
  const title = video.snippet?.title;
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <span className="text-sm text-gray-400 w-6 text-center shrink-0">{rank}</span>
      <img src={thumbnail} alt={title} className="w-16 h-10 object-cover rounded shrink-0" />
      <div className="flex-1 min-w-0">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600 truncate block"
        >
          {title}
        </a>
        <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          <span>조회 {formatCount(video.statistics?.viewCount)}</span>
          <span>좋아요 {formatCount(video.statistics?.likeCount)}</span>
          {video.contentDetails?.duration && (
            <span>{formatDuration(video.contentDetails.duration)}</span>
          )}
          <span>{formatDate(video.snippet?.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}
