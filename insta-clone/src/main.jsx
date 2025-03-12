import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// MSW 사용 여부를 환경 변수로 제어
const USE_MSW = false; // false로 설정하여 MSW 비활성화

// 📌 개발 환경에서만 MSW 실행 (USE_MSW가 true일 때만)
if (process.env.NODE_ENV === 'development' && USE_MSW) {
  // MSW를 동적으로 임포트하고, 워커를 시작
  import('./mocks/browser').then(({ worker }) => {
    worker.start().then(() => {
      // MSW 워커가 시작되면 React 앱 렌더링
      createRoot(document.getElementById('root')).render(<App />);
    });
  });
} else {
  // 🚀 MSW 없이 바로 React 렌더링
  createRoot(document.getElementById('root')).render(<App />);
}
