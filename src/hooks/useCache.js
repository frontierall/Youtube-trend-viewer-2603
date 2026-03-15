const CACHE_PREFIX = 'youtube_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5분

/**
 * 캐시 저장
 * @param {string} key - 캐시 키
 * @param {any} data - 저장할 데이터
 */
export function setCache(key, data) {
  const cacheData = {
    data,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
  } catch (e) {
    // localStorage 용량 초과 시 오래된 캐시 삭제
    clearExpiredCache();
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (e2) {
      console.warn('Cache storage failed:', e2);
    }
  }
}

/**
 * 캐시 조회
 * @param {string} key - 캐시 키
 * @returns {any|null} 캐시된 데이터 또는 null
 */
export function getCache(key) {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);

    // 만료 확인
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return data;
  } catch (e) {
    return null;
  }
}

/**
 * 캐시 키 생성
 * @param {string} regionCode - 국가 코드
 * @param {string} categoryId - 카테고리 ID
 * @returns {string} 캐시 키
 */
export function getCacheKey(regionCode, categoryId) {
  return `videos_${regionCode}_${categoryId}`;
}

/**
 * 만료된 캐시 삭제
 */
export function clearExpiredCache() {
  const keys = Object.keys(localStorage);
  const now = Date.now();

  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          if (now - timestamp > CACHE_EXPIRY) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    }
  });
}

/**
 * 모든 캐시 삭제
 */
export function clearAllCache() {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
