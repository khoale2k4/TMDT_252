'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import Button from '@/components/Button';
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
    id: 'credit-card',
    label: 'Credit Card',
    icon: CreditCard,
    description: 'Thanh toan bang the quoc te hoac the noi dia.',
  },
  {
    id: 'momo',
    label: 'Momo',
    icon: Smartphone,
    description: 'Thanh toan nhanh qua vi Momo.',
  },
  {
    id: 'sepay',
    label: 'Sepay',
    icon: Wallet,
    description: 'Quet ma hoac chuyen khoan voi Sepay.',
  },
  {
    id: 'qr',
    label: 'QR',
    icon: QrCode,
    description: 'Quet QR thanh toan tu ung dung ngan hang.',
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

  return new Intl.DateTimeFormat('en-US', {
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const rawDraft = sessionStorage.getItem(STORAGE_KEY);

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

  const handleFinish = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push(`/venues/${draft?.venueId || ''}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">Dang tai phien thanh toan...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-28">
        <div className="w-full max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Chua co thong tin dat san</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Ban hay quay lai trang chi tiet san, chon ngay va gio choi truoc khi thanh toan.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Tim san ngay
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
          Back
        </button>

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
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: CheckoutStep }) {
  const steps = [
    { id: 1, label: 'Review' },
    { id: 2, label: 'Payment' },
    { id: 3, label: 'Confirm' },
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
      <h1 className="text-3xl font-semibold text-slate-900">Review Your Booking</h1>

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start">
        <img
          src={draft.venueImage}
          alt={draft.venueName}
          className="h-28 w-full rounded-3xl object-cover shadow-sm sm:w-44"
        />

        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{draft.venueName}</h2>
          <div className="mt-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
            {draft.sportType}
          </div>
          <p className="mt-3 text-sm text-slate-500">{draft.venueAddress}</p>
          <p className="mt-2 text-sm font-medium text-slate-600">Court: {draft.courtName}</p>
        </div>
      </div>

      <div className="my-8 border-t border-slate-200" />

      <div className="grid gap-6 text-sm text-slate-600">
        <SummaryRow label="Date" value={formatDate(draft.bookingDate)} />
        <SummaryRow label="Time Slots" value={draft.slotTimes.join(', ')} />
        <SummaryRow label="Duration" value={`${draft.durationHours} hour(s)`} />
        <SummaryRow label="Total" value={formatCurrency(draft.totalPrice)} isStrong />
      </div>

      <div className="mt-10 rounded-[28px] bg-slate-50 px-6 py-5">
        <h3 className="text-lg font-medium text-slate-900">Cancellation Policy</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Free cancellation up to 24 hours before your booking. Cancellations made within 24 hours will be charged 50% of the booking fee.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          className="h-14 rounded-2xl text-base font-semibold"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="h-14 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200"
          onClick={onNext}
        >
          Next
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
      <h1 className="text-3xl font-semibold text-slate-900">Payment Method</h1>

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
          Back
        </Button>
        <Button
          size="lg"
          className="h-14 rounded-2xl text-base font-semibold shadow-lg shadow-blue-200"
          onClick={onNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

function ConfirmStep({
  draft,
  paymentLabel,
  onConfirm,
}: {
  draft: BookingDraft;
  paymentLabel: string;
  onConfirm: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-500 shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
        <BadgeCheck className="h-10 w-10" />
      </div>

      <h1 className="mt-8 text-4xl font-bold text-slate-900">Booking Confirmed</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
        Free cancellation up to 24 hours before your booking. Cancellations made within 24 hours will be charged 50% of the booking fee.
      </p>

      <div className="mt-8 w-full max-w-xl rounded-[28px] bg-white p-6 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
        <div className="space-y-4 text-sm text-slate-600">
          <SummaryRow label="Date" value={formatDate(draft.bookingDate)} />
          <SummaryRow label="Time Slots" value={draft.slotTimes.join(', ')} />
          <SummaryRow label="Duration" value={`${draft.durationHours} hour(s)`} />
          <SummaryRow label="Court" value={draft.venueName} />
          <SummaryRow label="Payment" value={paymentLabel} />
        </div>
      </div>

      <Button
        size="lg"
        className="mt-8 min-w-48 rounded-2xl px-8 text-base font-semibold shadow-lg shadow-blue-200"
        onClick={onConfirm}
      >
        Confirm
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
