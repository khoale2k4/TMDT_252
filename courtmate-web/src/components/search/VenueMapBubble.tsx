import Link from "next/link";
import { getSportTypeLabel } from '@/types/search';
import type { VenueSlotsData } from "@/types/slot";

type VenueMapBubbleProps = {
  data: VenueSlotsData;
  onClose: () => void;
};

export default function VenueMapBubble({ data, onClose }: VenueMapBubbleProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div
      className="relative w-72 rounded-xl border border-gray-100 bg-white p-4 font-sans shadow-2xl"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 text-gray-400 transition-colors hover:text-red-500"
        aria-label="Đóng chi tiết sân"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">Chi tiết Sân</h3>
      </div>

      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
        {data.courts.length === 0 && (
          <p className="text-sm text-gray-500">Không có slot trong khoảng ngày đã chọn.</p>
        )}
        {data.courts.map((court) => (
          <div key={court.court_id} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-blue-700">{court.court_name}</h4>
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                {getSportTypeLabel(court.sport_type)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {court.slots.map((slot) => {
                const isAvailable = slot.status === "available";
                const isLocked = slot.status === "locked";
                
                let containerClass = "cursor-not-allowed border-gray-200 bg-gray-50 opacity-70";
                let textClass = "text-gray-500 line-through";
                let statusLabel = <span className="mt-1 text-[10px] font-medium text-red-500">Đã đặt</span>;

                if (isAvailable) {
                  containerClass = "cursor-pointer border-green-200 bg-green-50 hover:bg-green-100 hover:shadow-sm";
                  textClass = "text-green-800";
                  statusLabel = <span className="mt-1 font-semibold text-gray-700">{formatPrice(slot.price)}</span>;
                } else if (isLocked) {
                  containerClass = "cursor-wait border-orange-200 bg-orange-50";
                  textClass = "text-orange-700";
                  statusLabel = <span className="mt-1 text-[10px] font-medium text-orange-500">Đang giữ chỗ</span>;
                }

                return (
                  <div
                    key={slot.slot_id}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2 text-xs transition-all ${containerClass}`}
                  >
                    <span className={`font-medium ${textClass}`}>
                      {slot.start_time} - {slot.end_time}
                    </span>
                    {statusLabel}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <Link
          href={`/venues/${data.venue_id}`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Xem chi tiết
        </Link>
      </div>

      <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-gray-100 bg-white shadow-sm"></div>
    </div>
  );
}
