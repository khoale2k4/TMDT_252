'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosClient from '@/services/axiosClient';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CreditCard,
  Loader,
  QrCode,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/Button';
import CountdownTimer from '@/components/CountdownTimer';
import type { BookingDraft } from '@/types/booking';

type CheckoutStep = 1 | 2 | 3;
type PaymentMethod = 'credit-card' | 'momo' | 'sepay' | 'qr';

const STORAGE_KEY = 'courtmate-booking-draft';

const paymentOptions: {
  id: PaymentMethod;
  label: string;
  icon: typeof CreditCard;
  description: string;
}[] = [
  {
    id: 'qr',
    label: 'QR Code',
    icon: QrCode,
    description: 'Thanh toán bằng QR Code VietQR',
  },
  {
    id: 'credit-card',
    label: 'Credit Card',
    icon: CreditCard,
    description: 'Thanh toán bằng thẻ quốc tế hoặc thẻ nội địa.',
  },
  {
    id: 'momo',
    label: 'Momo',
    icon: Smartphone,
    description: 'Thanh toán nhanh qua ví Momo.',
  },
  {
    id: 'sepay',
    label: 'Sepay',
    icon: Wallet,
    description: 'Quét mã hoặc chuyển khoản với Sepay.',
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<CheckoutStep>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const rawDraft = sessionStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.id) {
          setUserId(payload.id);
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }

    if (!rawDraft) {
      setDraft(null);
      setIsLoading(false);
      return;
    }

    try {
      setDraft(JSON.parse(rawDraft) as BookingDraft);
    } catch (error) {
      console.error('Unable to parse booking draft:', error);
      sessionStorage.removeItem(STORAGE_KEY);
      setDraft(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const paymentLabel = useMemo(
    () => paymentOptions.find((option) => option.id === paymentMethod)?.label || 'Credit Card',
    [paymentMethod]
  );

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setIsSubmitting(true);

      window.setTimeout(() => {
        setIsSubmitting(false);
        setStep(3);
      }, 700);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }

    setStep((currentStep) => (currentStep === 3 ? 2 : 1));
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        booking_items: draft?.slotIds.map((id) => ({
          slot_id: id,
          lock_token: (draft as any).lockTokens?.[id] || 'mock_lk_token' 
        })),
        add_ons: [],
        delivery: { required: false },
        payment_method: paymentMethod,
        coupon_code: ''
      };

      await axiosClient.post('/checkouts', payload);
      
      sessionStorage.removeItem(STORAGE_KEY);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Lỗi thanh toán:', error);
      const errorMessage = error.response?.data?.error?.message || 'Có lỗi xảy ra khi thanh toán. Vui lòng đăng nhập hoặc thử lại!';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimerExpire = () => {
    if (isSuccess) return;
    alert('Thời gian giữ chỗ đã hết. Vui lòng đặt lại sân.');
    sessionStorage.removeItem(STORAGE_KEY);
    router.push(`/venues/${draft?.venueId || ''}`);
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">Đang tải phiên thanh toán...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f0fdf4_0%,#f8fafc_22%,#ffffff_100%)] px-4 pt-28 pb-16">
        <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-emerald-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-[0_12px_30px_rgba(16,185,129,0.2)]">
            <BadgeCheck className="h-12 w-12 animate-bounce" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900">Thanh toán thành công!</h1>
          <p className="mt-3 text-base leading-6 text-slate-500">
            Sân của bạn đã được đặt và thanh toán hoàn tất thành công.
          </p>
          <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-left ring-1 ring-slate-100">
            <h3 className="font-semibold text-slate-900">Chi tiết đặt sân</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Sân chơi:</span>
                <span className="font-semibold text-slate-900">{draft?.venueName}</span>
              </div>
              <div className="flex justify-between">
                <span>Địa chỉ:</span>
                <span className="font-medium text-slate-900 text-right max-w-xs">{draft?.venueAddress}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày chơi:</span>
                <span className="font-semibold text-slate-900">{draft ? formatDate(draft.bookingDate) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Giờ chơi:</span>
                <span className="font-medium text-slate-950 bg-blue-50 px-2 py-0.5 rounded-md">{draft?.slotTimes.join(', ')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="text-base font-medium text-slate-900">Tổng cộng:</span>
                <span className="text-base font-bold text-blue-600">{draft ? formatCurrency(draft.totalPrice) : ''}</span>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/history"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 transition"
            >
              Lịch sử đặt sân
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-200 transition"
            >
              Đặt thêm sân mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-28">
        <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Chưa có thông tin đặt sân</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Bạn hãy quay lại trang chi tiết sân, chọn ngày và giờ chơi trước khi thanh toán.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Tìm sân ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_22%,#ffffff_100%)] px-4 pb-16 pt-28">
      <div className="mx-auto w-full max-w-7xl">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-3 rounded-full px-3 py-2 text-xl font-medium text-slate-900 transition hover:bg-white/80"
        >
          <ArrowLeft className="h-6 w-6" />
          Quay lại
        </button>

        <div className="mt-4 flex justify-center">
          <CountdownTimer onExpire={handleTimerExpire} />
        </div>

        <Stepper currentStep={step} />

        <div className="mx-auto mt-10 w-full max-w-4xl rounded-[36px] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 md:p-10">
          {step === 1 && <ReviewStep draft={draft} onNext={handleNext} onBack={() => router.back()} />}
          {step === 2 && (
            <PaymentStep
              paymentMethod={paymentMethod}
              onSelect={setPaymentMethod}
              onBack={() => setStep(1)}
              onNext={handleNext}
              isSubmitting={isSubmitting}
            />
          )}
          {step === 3 && (
            <ConfirmStep
              draft={draft}
              paymentLabel={paymentLabel}
              onConfirm={handleFinish}
              userId={userId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: CheckoutStep }) {
  const steps = [
    { id: 1, label: 'Xem lại' },
    { id: 2, label: 'Thanh toán' },
    { id: 3, label: 'Xác nhận' },
  ] as const;

  return (
    <div className="mx-auto mt-10 flex max-w-5xl items-center justify-center gap-4 overflow-x-auto px-2 py-2 md:gap-6">
      {steps.map((item, index) => (
        <div key={item.id} className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-medium ${
                currentStep === item.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {item.id}
            </div>
            <span className="text-xl font-medium text-slate-900">{item.label}</span>
          </div>

          {index < steps.length - 1 && <div className="h-px w-20 bg-slate-800/80 md:w-36" />}
        </div>
      ))}
    </div>
  );
}

function ReviewStep({
  draft,
  onBack,
  onNext,
}: {
  draft: BookingDraft;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-3xl font-semibold text-slate-900">Xem lại thông tin đặt lịch</h1>

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start">
        <img
          src={draft.venueImage}
          onError={e => e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/334155?text=CourtMate"}
          alt={draft.venueName}
          className="h-28 w-full rounded-3xl object-cover shadow-sm sm:w-44"
        />

        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{draft.venueName}</h2>
          <div className="mt-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
            {draft.sportType}
          </div>
          <p className="mt-3 text-sm text-slate-500">{draft.venueAddress}</p>
          <p className="mt-2 text-sm font-medium text-slate-600">Sân: {draft.courtName}</p>
        </div>
      </div>

      <div className="my-8 border-t border-slate-200" />

      <div className="grid gap-6 text-sm text-slate-600">
        <SummaryRow label="Ngày chơi" value={formatDate(draft.bookingDate)} />
        <SummaryRow label="Khung giờ" value={draft.slotTimes.join(', ')} />
        <SummaryRow label="Thời lượng" value={`${draft.durationHours} giờ`} />
        <SummaryRow label="Tổng cộng" value={formatCurrency(draft.totalPrice)} isStrong />
      </div>

      <div className="mt-10 rounded-[28px] bg-slate-50 px-6 py-5">
        <h3 className="text-lg font-medium text-slate-900">Chính sách hủy sân</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Miễn phí hủy sân trước 24 giờ kể từ giờ chơi. Hủy sân trong vòng 24 giờ sẽ tính phí 50% tổng tiền đặt sân.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          className="h-14 rounded-2xl text-base font-semibold"
          onClick={onBack}
        >
          Quay lại
        </Button>
        <Button
          size="lg"
          className="h-14 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200"
          onClick={onNext}
        >
          Tiếp theo
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({
  paymentMethod,
  onSelect,
  onBack,
  onNext,
  isSubmitting,
}: {
  paymentMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-3xl font-semibold text-slate-900">Phương thức thanh toán</h1>

      <div className="mt-10 space-y-5">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const active = paymentMethod === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`flex w-full items-center justify-between rounded-3xl border px-6 py-5 text-left transition ${
                active
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">{option.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                </div>
              </div>

              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {active && <Check className="h-4 w-4" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="my-10 border-t border-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          className="h-14 rounded-2xl text-base font-semibold"
          onClick={onBack}
        >
          Quay lại
        </Button>
        <Button
          size="lg"
          className="h-14 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200"
          onClick={onNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Tiếp theo'}
        </Button>
      </div>
    </div>
  );
}

function ConfirmStep({
  draft,
  paymentLabel,
  onConfirm,
  userId,
}: {
  draft: BookingDraft;
  paymentLabel: string;
  onConfirm: () => void;
  userId?: string;
}) {
  const [countdown, setCountdown] = useState(10);
  const [isPaid, setIsPaid] = useState(false);
  const hasTriggered = useRef(false);

  const memo = `CM${draft.venueId?.slice(0, 6)}${userId ? `-${userId.slice(0, 4)}` : ''}`.toUpperCase();

  useEffect(() => {
    if (paymentLabel !== 'QR Code') return;
    if (hasTriggered.current) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasTriggered.current) {
            hasTriggered.current = true;
            setIsPaid(true);
            onConfirm();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentLabel, onConfirm]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-500 shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
        <BadgeCheck className="h-10 w-10" />
      </div>

      <h1 className="mt-8 text-4xl font-bold text-slate-900">Đặt sân thành công</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
        Miễn phí hủy sân trước 24 giờ kể từ giờ chơi. Hủy sân trong vòng 24 giờ sẽ tính phí 50% tổng tiền đặt sân.
      </p>

      <div className="mt-8 w-full max-w-xl rounded-[28px] bg-white p-6 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
        <div className="space-y-4 text-sm text-slate-600">
          <SummaryRow label="Ngày đặt" value={formatDate(draft.bookingDate)} />
          <SummaryRow label="Khung giờ" value={draft.slotTimes.join(', ')} />
          <SummaryRow label="Thời lượng" value={`${draft.durationHours} giờ`} />
          <SummaryRow label="Cụm sân" value={draft.venueName} />
          <SummaryRow label="Phương thức" value={paymentLabel === 'QR Code' ? 'Chuyển khoản QR' : paymentLabel} />
        </div>
      </div>

      {paymentLabel === 'QR Code' ? (
        <div className="mt-8 flex w-full max-w-xl flex-col items-center justify-center rounded-[28px] bg-white p-8 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Quét mã VietQR để thanh toán</h2>
          <p className="mt-2 text-sm text-slate-500">Mở ứng dụng ngân hàng và quét mã bên dưới</p>
          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-slate-100 p-4 flex justify-center items-center bg-white max-w-[340px]">
            <img
              src={`https://img.vietqr.io/image/MB-0987654321-compact.png?amount=${draft.totalPrice}&addInfo=${memo}&accountName=COURTMATE`}
              alt="Mã VietQR Thanh Toán"
              className="w-full h-auto max-h-[320px] object-contain rounded-xl"
            />
          </div>
          <div className="mt-6 w-full rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>Nội dung chuyển khoản:</p>
            <p className="mt-1 text-lg font-bold text-slate-900 tracking-wider">{memo}</p>
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            {isPaid ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <Check className="h-5 w-5 animate-bounce" />
                <span>Thanh toán thành công! Đang chuyển hướng...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 font-semibold animate-pulse">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Đang chờ thanh toán (giả lập thành công sau {countdown}s)...</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <Button
        size="lg"
        className="mt-8 min-w-48 rounded-2xl px-8 text-base font-semibold shadow-lg shadow-blue-200"
        onClick={onConfirm}
        disabled={paymentLabel === 'QR Code' && isPaid}
      >
        {paymentLabel === 'QR Code' && isPaid ? 'Đang xử lý...' : 'Xác nhận'}
      </Button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  isStrong = false,
}: {
  label: string;
  value: string;
  isStrong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-base text-slate-600">{label}</span>
      <span className={`text-base ${isStrong ? 'font-semibold text-slate-900' : 'font-medium text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}
