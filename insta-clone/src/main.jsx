import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 📌 개발 환경에서만 MSW 실행
if (process.env.NODE_ENV === 'deployment') {
  // MSW를 동적으로 임포트하고, 워커를 시작
  import('./mocks/browser').then(({ worker }) => {
    worker.start().then(() => {
      // MSW 워커가 시작되면 React 앱 렌더링
      createRoot(document.getElementById('root')).render(<App />);
    });
  });
} else {
  // 🚀 배포 환경에서는 MSW 없이 바로 React 렌더링
  createRoot(document.getElementById('root')).render(<App />);
}
