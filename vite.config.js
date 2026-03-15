import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/Youtube-trend-viewer-2603/" // 레포지토리 이름과 동일하게!
})
