import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({
  initialMinutes = 10,
  onExpire,
}: {
  initialMinutes?: number;
  onExpire?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-orange-600">
      <Clock className="h-5 w-5" />
      <span className="font-semibold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="text-sm">thời gian giữ chỗ</span>
    </div>
  );
}
