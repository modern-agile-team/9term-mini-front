import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 📌 개발 환경에서만 MSW 실행

if (process.env.NODE_ENV === 'development') {
  const { startWorker } = await import('./mocks/browser');
  await startWorker();

  // 개발 환경에서의 React 렌더링 추가
  createRoot(document.getElementById('root')).render(<App />);
} else {
  // 🚀 배포 환경에서는 MSW 없이 바로 React 렌더링
  createRoot(document.getElementById('root')).render(<App />);
}
