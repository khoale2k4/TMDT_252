import { useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { SearchFilters } from "@/types/search";

const RADIUS_MAX = 50;

const SPORT_TYPES = [
  { label: "Pickleball", value: "pickleball" },
  { label: "Cầu lông", value: "badminton" },
  { label: "Tennis", value: "tennis" },
  { label: "Bóng đá", value: "soccer" },
  { label: "Bóng rổ", value: "basketball" },
  { label: "Bóng chuyền", value: "volleyball" },
  { label: "Bơi lội", value: "swimming" },
] as const;

const AMENITIES = [
  { label: "Bãi đậu xe", value: "parking" },
  { label: "Wifi", value: "wifi" },
  { label: "Phòng tắm", value: "shower" },
  { label: "Căn tin", value: "canteen" },
  { label: "Tủ đựng đồ", value: "locker" },
  { label: "Nước uống", value: "water" },
] as const;

const SURFACE_TYPES = [
  { label: "Cỏ nhân tạo", value: "artificial_grass" },
  { label: "Gỗ", value: "hardwood" },
  { label: "Xi măng", value: "concrete" },
  { label: "Cao su", value: "rubber" }
] as const;

const INPUT_CLASS_NAME =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

const CHECKBOX_CLASS_NAME = "h-4 w-4 rounded border-slate-300 text-blue-600";

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function CheckboxGroup({
  title,
  items,
  name,
  selectedValues,
}: {
  title: string;
  items: readonly { label: string; value: string }[];
  name: string;
  selectedValues: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-100">
        {items.map((item) => (
          <label key={item.value} className="inline-flex items-center gap-2">
            <input type="checkbox" name={name} value={item.value} className={CHECKBOX_CLASS_NAME}
              defaultChecked={selectedValues.includes(item.value)} />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SearchSidebarFilters({
  onApply,
}: {
  onApply: (filters: SearchFilters) => void;
}) {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const getParam = (fullKey: string, shortKey?: string) => {
    return searchParams.get(fullKey) || (shortKey ? searchParams.get(shortKey) : "") || "";
  };

  const getSelectedValues = (key: string, shortKey?: string) => {
    const values = [...searchParams.getAll(key), ...(shortKey ? searchParams.getAll(shortKey) : [])]
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    return Array.from(new Set(values));
  };

  const handleSubmit = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const filters: SearchFilters = {};

    const singleFields: Array<keyof SearchFilters> = ["radius_km", "date", "time_from", "time_to", "price_min", "price_max", "sort_by"];
    singleFields.forEach((field) => {
      const value = formData.get(field);
      if (typeof value === "string" && value) {
        filters[field] = value;
      }
    });

    const multiFields: Array<keyof SearchFilters> = ["sport_types", "amenities", "surface_types"];
    multiFields.forEach((field) => {
      const values = formData.getAll(field);
      if (values.length > 0) {
        filters[field] = values.join(",");
      }
    });

    onApply(filters);
  };

  return (
    // Bọc toàn bộ vào form, thêm flex-col để chia bố cục
    <form ref={formRef} className="mt-3 flex flex-col gap-3">

      {/* Vùng cuộn */}
      <div
        id="sidebar-filter-panel"
        className="max-h-[55vh] space-y-4 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/90"
      >
        <div>
          <FieldLabel htmlFor="radius-km">Bán kính tìm kiếm</FieldLabel>
          <input id="radius-km" name="radius_km" type="number" min={1} max={RADIUS_MAX} defaultValue={getParam("radius_km") || "5"} className={INPUT_CLASS_NAME} />
          <p className="mt-1 text-[11px] text-slate-500">Tối đa {RADIUS_MAX}km</p>
        </div>

        <CheckboxGroup title="Loại thể thao" items={SPORT_TYPES} name="sport_types" selectedValues={getSelectedValues("sport_types", "sp")} />

        <div>
          <FieldLabel htmlFor="filter-date">Ngày</FieldLabel>
          <input id="filter-date" name="date" type="date" defaultValue={getParam("date", "d")} className={INPUT_CLASS_NAME} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="time-from">Thời gian bắt đầu</FieldLabel>
            <input id="time-from" name="time_from" type="time" defaultValue={getParam("time_from", "t")} className={INPUT_CLASS_NAME} />
          </div>

          <div>
            <FieldLabel htmlFor="time-to">Thời gian kết thúc</FieldLabel>
            <input id="time-to" name="time_to" type="time" defaultValue={getParam("time_to")} className={INPUT_CLASS_NAME} />
          </div>
        </div>

        <CheckboxGroup title="Tiện nghi" items={AMENITIES} name="amenities" selectedValues={getSelectedValues("amenities")} />

        <CheckboxGroup title="Loại mặt sân" items={SURFACE_TYPES} name="surface_types" selectedValues={getSelectedValues("surface_types")} />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="price-min">Giá thấp nhất</FieldLabel>
            <input id="price-min" name="price_min" type="number" min={0} placeholder="0" defaultValue={getParam("price_min")} className={INPUT_CLASS_NAME} />
          </div>

          <div>
            <FieldLabel htmlFor="price-max">Giá cao nhất</FieldLabel>
            <input id="price-max" name="price_max" type="number" min={0} placeholder="1000000" defaultValue={getParam("price_max")} className={INPUT_CLASS_NAME} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="sort-by">Sắp xếp theo</FieldLabel>
          <select id="sort-by" name="sort_by" defaultValue={getParam("sort_by") || "distance"} className={INPUT_CLASS_NAME}>
            <option value="distance">Khoảng cách</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="rating">Đánh giá</option>
          </select>
        </div>
      </div>

      {/* Vùng nút bấm luôn nổi */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
      >
        Áp dụng bộ lọc
      </button>
    </form>
  );
}