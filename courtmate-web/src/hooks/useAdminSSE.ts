import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function useAdminSSE(venueId: string | null) {
  const [latestEvent, setLatestEvent] = useState<any>(null);

  useEffect(() => {
    if (!venueId) return;
    
    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1'}/admin/events/bookings?venueId=${venueId}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('SSE connection opened for venue', venueId);
    };

    eventSource.addEventListener('NEW_BOOKING', (event) => {
      try {
        const data = JSON.parse(event.data);
        toast.success(`🎉 Có đơn đặt sân mới! (Mã: ${data.bookingId?.substring(0, 8)})`);
        setLatestEvent({ type: 'NEW_BOOKING', data });
      } catch (err) {
        console.error('SSE Error parsing NEW_BOOKING', err);
      }
    });

    eventSource.addEventListener('UPDATE_BOOKING', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'confirmed' || data.status === 'completed') {
           toast.success(`✅ Đơn ${data.bookingId?.substring(0, 8)} đã cập nhật: ${data.status}`);
        } else if (data.status === 'cancelled') {
           toast.error(`❌ Đơn ${data.bookingId?.substring(0, 8)} đã bị huỷ!`);
        } else {
           toast.info(`🔔 Đơn ${data.bookingId?.substring(0, 8)} đã cập nhật: ${data.status}`);
        }
        setLatestEvent({ type: 'UPDATE_BOOKING', data });
      } catch (err) {
        console.error('SSE Error parsing UPDATE_BOOKING', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [venueId]);

  return latestEvent;
}
