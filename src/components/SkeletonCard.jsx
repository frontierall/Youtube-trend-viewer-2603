export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow animate-pulse">
      {/* 썸네일 스켈레톤 */}
      <div className="aspect-video bg-gray-300 dark:bg-gray-700" />

      {/* 컨텐츠 스켈레톤 */}
      <div className="p-4">
        {/* 제목 */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />

        {/* 채널명 */}
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2" />

        {/* 조회수/날짜 */}
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3" />
      </div>
    </div>
  );
}
