const SORT_OPTIONS = [
  { value: 'default', label: '기본 (인기순)' },
  { value: 'viewCount', label: '조회수순' },
  { value: 'likeCount', label: '좋아요순' },
  { value: 'newest', label: '최신순' },
  { value: 'subscriberCount', label: '구독자순', requiresChannelData: true },
];

export function SortSelector({ selectedSort, onSortChange, hasAllChannelData = false }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        정렬:
      </label>
      <select
        id="sort-select"
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.requiresChannelData && !hasAllChannelData}
          >
            {option.label}
            {option.requiresChannelData && !hasAllChannelData ? ' (전체 로드 필요)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
