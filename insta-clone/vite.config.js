import { defineConfig } from 'vite'; // Vite 설정을 정의하기 위한 함수를 import
import react from '@vitejs/plugin-react-swc'; // React와 SWC(Rust 기반 컴파일러)를 사용하기 위한 플러그인
import tailwindcss from '@tailwindcss/vite'; // Tailwind CSS를 Vite에서 사용하기 위한 플러그인
import path from 'path';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/ - Vite 공식 설정 문서 링크
export default defineConfig({
  plugins: [
    react(), // React 플러그인 활성화 (JSX 컴파일 등을 지원)
    tailwindcss(), // Tailwind CSS 플러그인 활성화 (스타일 처리)
    mkcert(),
  ],
  resolve: {
    // resolve를 server 밖으로 이동
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // 개발 서버가 실행될 포트 번호 지정
    // CORS(Cross-Origin Resource Sharing) 이슈 해결을 위한 프록시 설정
    proxy: {
      '/api': {
        // '/api'로 시작하는 모든 요청에 대해
        target: 'https://api.modonggu.site/', // 실제 백엔드 서버 주소로 포워딩
        changeOrigin: true, // 요청 헤더의 host 값을 target URL로 변경
        secure: false, // HTTPS 검증 비활성화 (개발 환경에서 사용)
      },
    },
  },
});
