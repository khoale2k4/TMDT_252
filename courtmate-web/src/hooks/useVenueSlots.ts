import { useEffect, useMemo, useState } from "react";
import axiosClient from "@/services/axiosClient";
import API_ENDPOINTS from "@/services/apiEndpoints";
import type { VenueSlotsData } from "@/types/slot";

// const formatDateParam = (date: Date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

type UseVenueSlotsResult = {
  selectedVenueSlots: VenueSlotsData | null;
  slotLoading: boolean;
  slotError: string | null;
  clearVenueSlots: () => void;
};

export default function useVenueSlots(selectedVenueId: string | null): UseVenueSlotsResult {
  const [selectedVenueSlots, setSelectedVenueSlots] = useState<VenueSlotsData | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVenueId) {
      setSelectedVenueSlots(null);
      setSlotError(null);
      setSlotLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchVenueSlots = async (isBackgroundPolling = false) => {
      if (!isBackgroundPolling) {
        setSlotLoading(true);
      }
      setSlotError(null);
      setSelectedVenueSlots(null);

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 7);

      const dateTo = new Date(dateFrom);
      dateTo.setDate(dateFrom.getDate() + 14);

      try {
        const res = await axiosClient.get<{ data?: VenueSlotsData; venue_id?: string; courts?: VenueSlotsData["courts"] }>(
          API_ENDPOINTS.VENUES.SLOT(selectedVenueId),
          // {
          // params: {
          //   date_from: formatDateParam(dateFrom),
          //   date_to: formatDateParam(dateTo),
          // },
          // }
        );

        const normalized = res.data?.data || {
          venue_id: res.data?.venue_id || selectedVenueId,
          courts: res.data?.courts || [],
        };

        if (!isCancelled) {
          setSelectedVenueSlots(normalized);
        }
      } catch {
        if (!isCancelled) {
          setSlotError("Không thể tải lịch sân.");
        }
      } finally {
        if (!isCancelled && !isBackgroundPolling) {
          setSlotLoading(false);
        }
      }
    };

    fetchVenueSlots();

    // Short Polling: Tự động refresh mỗi 10s
    const pollingInterval = setInterval(() => {
      fetchVenueSlots(true);
    }, 10000);

    return () => {
      isCancelled = true;
      clearInterval(pollingInterval);
    };
  }, [selectedVenueId]);

  const clearVenueSlots = useMemo(
    () => () => {
      setSelectedVenueSlots(null);
      setSlotError(null);
      setSlotLoading(false);
    },
    []
  );

  return {
    selectedVenueSlots,
    slotLoading,
    slotError,
    clearVenueSlots,
  };
}
