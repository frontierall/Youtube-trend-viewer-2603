import { useState, useMemo } from 'react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { CountrySelector } from './components/CountrySelector';
import { CategoryFilter } from './components/CategoryFilter';
import { SortSelector } from './components/SortSelector';
import { VideoGrid } from './components/VideoGrid';
import { StatsDashboard } from './components/StatsDashboard';
import { useYouTubeApi } from './hooks/useYouTubeApi';
import { useFavorites } from './hooks/useFavorites';
import { useDarkMode } from './hooks/useDarkMode';
import { useChannelData } from './hooks/useChannelData';
import { STORAGE_KEY, COUNTRIES } from './utils/constants';

function App() {
  // API 키 상태 (localStorage에서 초기화)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  // 필터 상태
  const [selectedCountry, setSelectedCountry] = useState('KR');
  const [selectedCategory, setSelectedCategory] = useState('0');
  const [selectedSort, setSelectedSort] = useState('default');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 즐겨찾기 훅
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // 다크 모드 훅
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // 채널 데이터 훅 (온디맨드)
  const {
    loadChannelData,
    loadAllChannelData,
    isLoading: isChannelLoading,
    isAnyLoading: isAnyChannelLoading,
    getChannelData,
    hasAllChannelData,
  } = useChannelData(apiKey);

  // YouTube API 훅 사용
  const { videos, loading, error, fromCache, forceRefetch } = useYouTubeApi(
    apiKey,
    selectedCountry,
    selectedCategory
  );

  // 모든 채널 데이터 로드 여부 확인
  const allChannelIds = useMemo(() => {
    if (!videos || videos.length === 0) return [];
    return videos.map((v) => v.snippet?.channelId).filter(Boolean);
  }, [videos]);

  const allChannelDataLoaded = useMemo(() => {
    return allChannelIds.length > 0 && hasAllChannelData(allChannelIds);
  }, [allChannelIds, hasAllChannelData]);

  // 전체 구독자 로드 핸들러
  const handleLoadAllSubscribers = () => {
    if (allChannelIds.length > 0) {
      loadAllChannelData(allChannelIds);
    }
  };

  // 필터링 및 정렬된 비디오 목록
  const sortedVideos = useMemo(() => {
    if (!videos || videos.length === 0) return videos;

    // 즐겨찾기 필터
    let filtered = showFavoritesOnly
      ? videos.filter((v) => isFavorite(v.id))
      : videos;

    const sorted = [...filtered];

    switch (selectedSort) {
      case 'viewCount':
        return sorted.sort((a, b) =>
          parseInt(b.statistics?.viewCount || 0) - parseInt(a.statistics?.viewCount || 0)
        );
      case 'likeCount':
        return sorted.sort((a, b) =>
          parseInt(b.statistics?.likeCount || 0) - parseInt(a.statistics?.likeCount || 0)
        );
      case 'newest':
        return sorted.sort((a, b) =>
          new Date(b.snippet?.publishedAt) - new Date(a.snippet?.publishedAt)
        );
      case 'subscriberCount':
        return sorted.sort((a, b) => {
          const aData = getChannelData(a.snippet?.channelId);
          const bData = getChannelData(b.snippet?.channelId);
          const aCount = parseInt(aData?.subscriberCount || 0);
          const bCount = parseInt(bData?.subscriberCount || 0);
          return bCount - aCount;
        });
      default:
        return filtered; // 기본 순서 유지
    }
  }, [videos, selectedSort, showFavoritesOnly, isFavorite, getChannelData]);

  // 현재 선택된 국가명 가져오기
  const currentCountryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              인기 급상승 동영상
            </h1>

            <div className="flex items-center gap-4">
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
              <button
                onClick={forceRefetch}
                disabled={loading || !apiKey}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="새로고침 (캐시 무시)"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* 다크 모드 토글 */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isDarkMode ? '라이트 모드' : '다크 모드'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* API 키 입력 섹션 */}
        <section className="mb-6">
          <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />
        </section>

        {/* 카테고리 필터 */}
        <section className="mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </section>

        {/* 결과 헤더 */}
        {apiKey && !loading && videos.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-4">
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">{currentCountryName}</span> 인기 동영상
                <span className="font-medium ml-1">{sortedVideos.length}</span>개
                {showFavoritesOnly && <span className="ml-1">(즐겨찾기)</span>}
                {fromCache && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">(캐시)</span>
                )}
              </div>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showFavoritesOnly
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={showFavoritesOnly ? 'currentColor' : 'none'}
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
                즐겨찾기 ({favorites.length})
              </button>
              {/* 통계 버튼 */}
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                통계
              </button>
              {/* 전체 구독자 보기 버튼 */}
              {!allChannelDataLoaded && (
                <button
                  onClick={handleLoadAllSubscribers}
                  disabled={isAnyChannelLoading()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`${allChannelIds.length}개 채널의 구독자 수 로드 (API ${allChannelIds.length} 유닛 소비)`}
                >
                  {isAnyChannelLoading() ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      로딩 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      전체 구독자 보기
                    </>
                  )}
                </button>
              )}
              {allChannelDataLoaded && (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  구독자 로드 완료
                </span>
              )}
            </div>
            <SortSelector
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              hasAllChannelData={allChannelDataLoaded}
            />
          </div>
        )}

        {/* 비디오 그리드 */}
        <VideoGrid
          videos={sortedVideos}
          loading={loading}
          error={error}
          hasApiKey={!!apiKey}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          loadChannelData={loadChannelData}
          isChannelLoading={isChannelLoading}
          getChannelData={getChannelData}
        />
      </main>

      {/* 통계 대시보드 모달 */}
      <StatsDashboard
        videos={videos}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />

      {/* 푸터 */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>YouTube Data API v3를 사용합니다.</p>
          <p className="mt-1">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Cloud Console
            </a>
            에서 API 키를 발급받으세요.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
