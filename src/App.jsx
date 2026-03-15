import { useState, useEffect } from 'react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { CountrySelector } from './components/CountrySelector';
import { CategoryFilter } from './components/CategoryFilter';
import { VideoGrid } from './components/VideoGrid';
import { useYouTubeApi } from './hooks/useYouTubeApi';
import { STORAGE_KEY, COUNTRIES } from './utils/constants';

function App() {
  // API 키 상태 (localStorage에서 초기화)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  // 필터 상태
  const [selectedCountry, setSelectedCountry] = useState('KR');
  const [selectedCategory, setSelectedCategory] = useState('0');

  // YouTube API 훅 사용
  const { videos, loading, error, refetch } = useYouTubeApi(
    apiKey,
    selectedCountry,
    selectedCategory
  );

  // 현재 선택된 국가명 가져오기
  const currentCountryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
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
                onClick={refetch}
                disabled={loading || !apiKey}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="새로고침"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
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
          <div className="mb-4 text-gray-600">
            <span className="font-medium">{currentCountryName}</span> 인기 동영상
            <span className="font-medium ml-1">{videos.length}</span>개
          </div>
        )}

        {/* 비디오 그리드 */}
        <VideoGrid videos={videos} loading={loading} error={error} />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
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
