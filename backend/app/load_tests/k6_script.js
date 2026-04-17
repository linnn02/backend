import { sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // scale up
    { duration: '30s', target: 50 }, // hold
    { duration: '10s', target: 100 }, // peak
    { duration: '10s', target: 0 }, // scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export default function () {
  // Test search functionality
  const res = http.get('http://localhost:3000/publications/search/all?q=quantum');
  if (res.status !== 200) {
    console.error(`Received unexpected status code: ${res.status}`);
  }
  sleep(1);
}
