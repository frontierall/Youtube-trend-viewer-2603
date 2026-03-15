/**
 * 조회수를 한국어 형식으로 포맷팅
 * @param {number|string} count - 조회수
 * @returns {string} 포맷팅된 조회수 문자열
 */
export function formatViewCount(count) {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;

  if (isNaN(num)) {
    return '0회';
  }

  if (num >= 100000000) {
    // 1억 이상
    const billions = num / 100000000;
    return `${billions.toFixed(1).replace(/\.0$/, '')}억회`;
  }

  if (num >= 10000) {
    // 1만 이상
    const tenThousands = num / 10000;
    return `${tenThousands.toFixed(1).replace(/\.0$/, '')}만회`;
  }

  if (num >= 1000) {
    // 1천 이상
    const thousands = num / 1000;
    return `${thousands.toFixed(1).replace(/\.0$/, '')}천회`;
  }

  return `${num}회`;
}

/**
 * 날짜를 상대적 시간으로 포맷팅
 * @param {string} dateString - ISO 8601 형식의 날짜 문자열
 * @returns {string} 상대적 시간 문자열
 */
/**
 * 숫자를 간략한 형식으로 포맷팅 (좋아요, 댓글 수용)
 * @param {number|string} count - 숫자
 * @returns {string} 포맷팅된 문자열
 */
export function formatCount(count) {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;

  if (isNaN(num) || num === 0) {
    return '0';
  }

  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
  }

  if (num >= 10000) {
    return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}만`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}천`;
  }

  return `${num}`;
}

/**
 * ISO 8601 duration을 읽기 쉬운 형식으로 변환
 * @param {string} duration - ISO 8601 형식 (예: PT5M30S, PT1H2M3S)
 * @returns {string} 포맷팅된 시간 (예: 5:30, 1:02:03)
 */
export function formatDuration(duration) {
  if (!duration) return '0:00';

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears}년 전`;
  if (diffMonths > 0) return `${diffMonths}개월 전`;
  if (diffWeeks > 0) return `${diffWeeks}주 전`;
  if (diffDays > 0) return `${diffDays}일 전`;
  if (diffHours > 0) return `${diffHours}시간 전`;
  if (diffMinutes > 0) return `${diffMinutes}분 전`;
  return '방금 전';
}
