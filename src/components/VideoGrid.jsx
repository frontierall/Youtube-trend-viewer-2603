import { VideoCard } from './VideoCard';
import { SkeletonCard } from './SkeletonCard';

export function VideoGrid({ videos, loading, error, hasApiKey, isFavorite, onToggleFavorite, loadChannelData, isChannelLoading, getChannelData }) {
  // API 키가 없을 때 안내 메시지
  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-gray-400 text-6xl mb-4">🔑</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">API 키를 입력해주세요</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          YouTube 인기 동영상을 보려면 위에 API 키를 입력하세요.
        </p>
      </div>
    );
  }

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-red-500 text-6xl mb-4">!</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">오류가 발생했습니다</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">{error}</p>
      </div>
    );
  }

  // 비디오가 없을 때
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📺</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">동영상이 없습니다</h3>
        <p className="text-gray-600 dark:text-gray-400">선택한 조건에 맞는 인기 동영상이 없습니다.</p>
      </div>
    );
  }

  // 비디오 그리드 표시
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          rank={index + 1}
          isFavorite={isFavorite?.(video.id)}
          onToggleFavorite={onToggleFavorite}
          loadChannelData={loadChannelData}
          isChannelLoading={isChannelLoading}
          getChannelData={getChannelData}
        />
      ))}
    </div>
  );
}
