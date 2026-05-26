import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50, // 50 Virtual Users concurrent
  duration: '10s', // Bắn liên tục trong 10 giây
};

export default function () {
  // Mock request to checkout a specific slot to simulate overbooking
  const url = 'http://localhost:3001/api/v1/checkouts';
  
  const payload = JSON.stringify({
    booking_items: [
      {
        slot_id: "demo-slot-id-123", // Phải thay bằng ID slot thực tế trong DB đang rỗng
        lock_token: "test_token"
      }
    ],
    payment_method: "momo"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer MOCK_JWT' // B2C service đang bỏ qua JWT verify tạm thời hoặc mock
    },
  };

  const res = http.post(url, payload, params);

  // Optimistic lock (hoặc version/locked_by) sẽ khiến chỉ 1 user thành công, các user khác bị lỗi 400 hoặc 500
  check(res, {
    'is status 201 (Success - booked)': (r) => r.status === 201,
    'is status 400 (Failed - locked by other)': (r) => r.status === 400,
    'is status 500 (Failed - concurrency error)': (r) => r.status === 500,
  });

  sleep(0.1);
}
