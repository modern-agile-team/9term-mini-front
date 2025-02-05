// src/mocks/browser.js
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// 워커 설정 옵션 추가
const workerOptions = {
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
};

export const startWorker = () => worker.start(workerOptions);
