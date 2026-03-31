# 🏸 Sports Court Booking Platform — API Document

**Version:** 1.0.0  
**Base URL:** `https://api.sportscourt.vn/v1`  
**Auth:** `Authorization: Bearer <JWT>`  
**Content-Type:** `application/json`

---

## Quy ước chung

- Tất cả timestamp dùng ISO 8601: `2025-07-15T14:00:00+07:00`
- ID dùng định dạng UUID v4
- Tiền tệ tính bằng VNĐ (số nguyên, không dùng số thập phân)
- Mọi API cần xác thực đều gắn header `Authorization: Bearer <token>`

### Cấu trúc lỗi chuẩn

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "Slot này đã được đặt.",
    "details": {}
  }
}
```

---

# PHÂN HỆ 1 — B2C Platform

---

## 1.1 · Tìm kiếm sân gần đây

### `GET /venues/nearby`

**Headers:**
```
Authorization: Bearer <token>   (không bắt buộc)
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `lat` | float | ✅ | Vĩ độ. VD: `10.7769` |
| `lng` | float | ✅ | Kinh độ. VD: `106.7009` |
| `radius_km` | float | ✅ | Bán kính tìm kiếm (km), tối đa 50 |
| `sport_types` | string | ❌ | VD: `pickleball,badminton,tennis` |
| `date` | date | ❌ | VD: `2025-07-15` |
| `time_from` | time | ❌ | VD: `08:00` |
| `time_to` | time | ❌ | VD: `10:00` |
| `amenities` | string | ❌ | VD: `parking,shower` |
| `price_min` | integer | ❌ | Giá tối thiểu (VNĐ/giờ) |
| `price_max` | integer | ❌ | Giá tối đa (VNĐ/giờ) |
| `sort_by` | string | ❌ | `distance` \| `price_asc` \| `rating` |
| `page` | integer | ❌ | Default: `1` |
| `limit` | integer | ❌ | Default: `20`, tối đa `50` |

**Response 200 — Thành công:**

```json
{
  "data": {
    "venues": [
      {
        "venue_id": "v_9f2a1b3c",
        "name": "Sân Pickleball Quận 7 Arena",
        "address": "123 Nguyễn Thị Thập, Quận 7, TP.HCM",
        "distance_km": 1.24,
        "sport_types": ["pickleball", "badminton"],
        "amenities": ["parking", "shower", "locker"],
        "courts_available": 3,
        "price_range": {
          "min": 80000,
          "max": 180000
        },
        "rating": {
          "average": 4.7,
          "total_reviews": 128
        },
        "cover_image_url": "https://cdn.sportscourt.vn/venues/v_9f2a1b3c/cover.jpg",
        "is_open_now": true,
        "next_available_slot": "2025-07-15T14:00:00+07:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

**Response 400:**
```json
{
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "Tọa độ không hợp lệ. lat phải trong khoảng [-90, 90]."
  }
}
```

---

## 1.2 · Xem lịch trống của sân

### `GET /venues/{venue_id}/slots`

**Path Parameters:**

| Tham số | Mô tả |
|---|---|
| `venue_id` | UUID của venue |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `date_from` | date | ✅ | VD: `2025-07-15` |
| `date_to` | date | ✅ | Tối đa +14 ngày |
| `sport_type` | string | ❌ | Lọc theo loại sân |

**Response 200:**

```json
{
  "data": {
    "venue_id": "v_9f2a1b3c",
    "courts": [
      {
        "court_id": "c_1a2b3c",
        "court_name": "Sân A1",
        "sport_type": "pickleball",
        "slots": [
          {
            "slot_id": "s_001",
            "date": "2025-07-15",
            "start_time": "08:00",
            "end_time": "09:00",
            "status": "available",
            "price": 120000,
            "version": 7
          },
          {
            "slot_id": "s_002",
            "date": "2025-07-15",
            "start_time": "09:00",
            "end_time": "10:00",
            "status": "booked",
            "price": 120000,
            "version": 3
          }
        ]
      }
    ]
  }
}
```

---

## 1.3 · Khóa Slot tạm thời (5–10 phút)

### `POST /slots/{slot_id}/lock`

**Mô tả:** Tạm giữ slot để người dùng hoàn tất checkout. Dùng `expected_version` để tránh 2 người cùng đặt một slot.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

| Tham số | Mô tả |
|---|---|
| `slot_id` | UUID của slot |

**Request Body:**

```json
{
  "expected_version": 7,
  "lock_duration_minutes": 8
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `expected_version` | integer | ✅ | Version slot client đang thấy |
| `lock_duration_minutes` | integer | ❌ | 5–10 phút. Default: `8` |

**Response 200 — Lock thành công:**

```json
{
  "data": {
    "lock_token": "lk_7f3d9e2a1b",
    "slot_id": "s_001",
    "locked_until": "2025-07-15T08:08:00+07:00",
    "new_version": 8,
    "slot_details": {
      "court_id": "c_1a2b3c",
      "date": "2025-07-15",
      "start_time": "08:00",
      "end_time": "09:00",
      "price": 150000
    }
  },
  "message": "Slot đã được giữ chỗ. Vui lòng hoàn thành thanh toán trong 8 phút."
}
```

**Response 409 — Slot đã bị thay đổi:**

```json
{
  "error": {
    "code": "SLOT_VERSION_CONFLICT",
    "message": "Slot vừa bị cập nhật bởi người khác. Vui lòng tải lại lịch.",
    "details": {
      "current_version": 8,
      "your_version": 7
    }
  }
}
```

**Response 410 — Slot không còn trống:**

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "Slot này đã được đặt."
  }
}
```

**Luồng xử lý:**
```
1. Nhận request
2. Kiểm tra JWT hợp lệ
3. Truy vấn DB: SELECT slot_id, version, status FROM SLOTS WHERE id = :slot_id
4. Nếu version != expected_version → trả 409
5. Nếu status != 'available' → trả 410
6. UPDATE SLOTS SET status='locked', locked_by=:user_id,
   locked_until=NOW()+:minutes, version=version+1
   WHERE id = :slot_id AND version = :expected_version
7. Nếu UPDATE không ảnh hưởng dòng nào → trả 409 (race condition)
8. Trả 200 kèm lock_token
```

---

## 1.4 · Checkout — Tạo đơn & khởi tạo thanh toán

### `POST /checkouts`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "booking_items": [
    {
      "slot_id": "s_001",
      "lock_token": "lk_7f3d9e2a1b"
    }
  ],
  "add_ons": [
    {
      "product_id": "p_racket_001",
      "quantity": 2
    }
  ],
  "delivery": {
    "required": true,
    "address": "123 Lê Văn Lương, Quận 7, TP.HCM",
    "lat": 10.7301,
    "lng": 106.7218,
    "delivery_time": "2025-07-15T07:30:00+07:00"
  },
  "payment_method": "momo",
  "coupon_code": "SUMMER2025",
  "notes": "Cần thêm ghế ngồi ngoài sân"
}
```

**Response 201 — Tạo thành công:**

```json
{
  "data": {
    "checkout_id": "co_3e7f2a1b9c",
    "status": "pending_payment",
    "expires_at": "2025-07-15T08:08:00+07:00",
    "line_items": {
      "booking_fees": [
        {
          "slot_id": "s_001",
          "description": "Sân A1 · 08:00–09:00 · 15/07/2025",
          "price": 150000
        }
      ],
      "add_ons": [
        {
          "product_id": "p_racket_001",
          "name": "Vợt Pickleball Starter",
          "unit_price": 50000,
          "quantity": 2,
          "subtotal": 100000
        }
      ],
      "delivery_fee": 25000,
      "discount": -27000
    },
    "pricing_summary": {
      "subtotal": 270000,
      "add_ons": 100000,
      "delivery_fee": 25000,
      "discount": -27000,
      "vat": 29440,
      "total": 397440,
      "currency": "VND"
    },
    "payment": {
      "method": "momo",
      "payment_url": "https://payment.momo.vn/pay?token=momo_tk_abc123"
    }
  }
}
```

**Response 400 — Lock token hết hạn:**

```json
{
  "error": {
    "code": "LOCK_EXPIRED",
    "message": "Thời gian giữ chỗ đã hết cho slot s_001. Vui lòng chọn lại."
  }
}
```

**Luồng xử lý:**
```
1. Validate lock_token còn hiệu lực với slot tương ứng
2. Gọi Ahamove Estimate API để lấy phí giao hàng (nếu có)
3. Áp dụng coupon, tính VAT
4. INSERT INTO BOOKINGS, BOOKING_PAYMENTS, BOOKING_ADDONS
5. UPDATE SLOTS SET status='booked'
6. Gọi MoMo/ZaloPay API để tạo payment session → lấy payment_url
7. Trả 201
```

---

# PHÂN HỆ 2 — Smart Admin Panel

---

## 2.1 · Xem lịch theo ngày (Grid View)

### `GET /admin/venues/{venue_id}/calendar`

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `date` | date | ✅ | VD: `2025-07-15` |
| `sport_type` | string | ❌ | Lọc theo loại sân |

**Response 200:**

```json
{
  "data": {
    "venue_id": "v_9f2a1b3c",
    "date": "2025-07-15",
    "courts": [
      {
        "court_id": "c_1a2b3c",
        "court_name": "Sân A1",
        "sport_type": "pickleball",
        "slots": [
          {
            "slot_id": "s_001",
            "start_time": "08:00",
            "end_time": "09:00",
            "status": "booked",
            "version": 12,
            "booking": {
              "booking_id": "bk_xyz789",
              "customer_name": "Nguyễn Văn A",
              "customer_phone": "0901234567",
              "total_paid": 150000,
              "payment_status": "paid",
              "has_delivery": true,
              "notes": "Cần thêm ghế"
            }
          },
          {
            "slot_id": "s_002",
            "start_time": "09:00",
            "end_time": "10:00",
            "status": "available",
            "version": 3,
            "price": 150000,
            "booking": null
          }
        ]
      }
    ],
    "summary": {
      "total_slots": 48,
      "booked": 21,
      "available": 22,
      "locked": 3,
      "maintenance": 2,
      "occupancy_rate": 0.4375,
      "revenue_today": 3150000
    }
  }
}
```

---

## 2.2 · Cập nhật Slot — Đổi lịch / Bảo trì

### `PATCH /admin/slots/{slot_id}`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "expected_version": 12,
  "action": "reschedule",
  "new_slot_id": "s_010",
  "reason": "Khách yêu cầu đổi giờ",
  "notify_customer": true
}
```

| Field | Kiểu | Mô tả |
|---|---|---|
| `expected_version` | integer | Version hiện tại để tránh xung đột |
| `action` | string | `reschedule` \| `cancel` \| `set_maintenance` \| `mark_checkin` |
| `new_slot_id` | string | Bắt buộc nếu `action = reschedule` |
| `reason` | string | Lý do thay đổi (lưu vào audit log) |
| `notify_customer` | boolean | Gửi thông báo cho khách không |

**Response 200:**

```json
{
  "data": {
    "slot_id": "s_001",
    "new_slot_id": "s_010",
    "action": "reschedule",
    "new_version": 13,
    "audit_log_id": "al_9f3c1a",
    "customer_notified": true,
    "message": "Đổi lịch thành công."
  }
}
```

**Response 409:**

```json
{
  "error": {
    "code": "SLOT_VERSION_CONFLICT",
    "message": "Slot đã bị thay đổi bởi thao tác khác. Vui lòng tải lại lịch.",
    "details": {
      "current_version": 13,
      "your_version": 12
    }
  }
}
```

**Response 403:**

```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Bạn không có quyền thực hiện thao tác này. Yêu cầu role: manager."
  }
}
```

**Luồng xử lý:**
```
1. Kiểm tra JWT và RBAC (role >= manager)
2. BEGIN TRANSACTION
3. SELECT version, status FROM SLOTS WHERE id = :slot_id FOR UPDATE
4. Kiểm tra version == expected_version, nếu sai → 409
5. Nếu action = 'reschedule':
   - Kiểm tra new_slot_id status = 'available'
   - UPDATE slot cũ → status = 'available'
   - UPDATE slot mới → status = 'booked'
   - UPDATE BOOKINGS SET slot_id = new_slot_id
6. INSERT INTO AUDIT_LOGS (entity, action, old_value, new_value, reason, performed_by)
7. COMMIT
8. Nếu notify_customer = true → gửi SMS/Email cho khách
9. Trả 200
```

---

## 2.3 · Webhook nhận kết quả thanh toán → Xuất hóa đơn MISA

### `POST /webhooks/payment/{provider}`

**Path Parameters:**

| Tham số | Mô tả |
|---|---|
| `provider` | `momo` \| `zalopay` |

**Headers (từ Payment Provider):**
```
Content-Type: application/json
X-Signature: <HMAC-SHA256 signature>
```

**Request Body (từ MoMo):**

```json
{
  "orderId": "co_3e7f2a1b9c",
  "transId": "3086823480",
  "amount": 397440,
  "resultCode": 0,
  "message": "Thành công."
}
```

**Response 200:**

```json
{ "status": 0, "message": "success" }
```

**Luồng xử lý:**
```
1. Xác minh HMAC-SHA256 signature từ provider
2. Kiểm tra orderId đã xử lý chưa (tránh gọi 2 lần dựa vào INVOICES.status)
3. BEGIN TRANSACTION
4. UPDATE BOOKING_PAYMENTS SET status='paid', provider_transaction_id=:transId
5. UPDATE BOOKINGS SET status='confirmed'
6. COMMIT
7. Nếu có delivery → gọi Ahamove Create Order API
8. Gọi MISA meInvoice API để xuất hóa đơn:
   POST https://api.meinvoice.vn/api/v1/invoices { ...thông tin booking... }
   → Nhận invoice_no, pdf_url
9. INSERT INTO INVOICES (booking_id, misa_invoice_no, pdf_url, status='issued')
10. Gửi email xác nhận + đính kèm PDF hóa đơn cho khách
11. Trả 200 cho provider
```

---

## 2.4 · Danh sách hóa đơn

### `GET /admin/invoices`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
```

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `date_from` | date | Ngày bắt đầu |
| `date_to` | date | Ngày kết thúc |
| `status` | string | `pending` \| `issued` \| `cancelled` |
| `search` | string | Tìm theo tên KH hoặc booking_id |
| `page` | integer | Default: `1` |
| `limit` | integer | Default: `20` |

**Response 200:**

```json
{
  "data": {
    "invoices": [
      {
        "invoice_id": "inv_001",
        "booking_id": "bk_xyz789",
        "misa_invoice_no": "0000123",
        "buyer_name": "Nguyễn Văn A",
        "total": 397440,
        "status": "issued",
        "pdf_url": "https://misa.vn/invoices/0000123.pdf",
        "issued_at": "2025-07-15T08:10:00+07:00"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 87,
      "total_pages": 5
    }
  }
}
```

---

# PHÂN HỆ 3 — AI Dynamic Pricing

---

## 3.1 · Tạo Pricing Rule

### `POST /admin/pricing-rules`

**Headers:**
```
Authorization: Bearer <token>   (role: owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "venue_id": "v_9f2a1b3c",
  "rule_name": "Giờ Vàng Cuối Tuần",
  "description": "Tăng giá vào giờ cao điểm cuối tuần",
  "priority": 10,
  "is_active": true,
  "conditions": {
    "operator": "AND",
    "rules": [
      {
        "field": "day_of_week",
        "operator": "IN",
        "value": ["saturday", "sunday"]
      },
      {
        "field": "hour_of_day",
        "operator": "BETWEEN",
        "value": [17, 21]
      },
      {
        "field": "occupancy_rate",
        "operator": ">=",
        "value": 0.70
      }
    ]
  },
  "adjustments": {
    "type": "percentage",
    "value": 40,
    "cap_price": 300000,
    "floor_price": 80000
  },
  "valid_from": "2025-07-01",
  "valid_to": "2025-12-31"
}
```

| Field | Mô tả |
|---|---|
| `conditions` | Cấu trúc điều kiện lồng nhau, lưu dạng JSONB trong DB |
| `adjustments.type` | `percentage` (tăng %) hoặc `fixed_amount` (tăng số tiền cố định) |
| `adjustments.cap_price` | Giá trần tuyệt đối |
| `priority` | Rule có priority cao hơn sẽ được áp dụng nếu nhiều rule cùng khớp |

**Response 201:**

```json
{
  "data": {
    "rule_id": "pr_7a3c1f9e",
    "rule_name": "Giờ Vàng Cuối Tuần",
    "status": "active",
    "created_at": "2025-07-10T10:00:00+07:00"
  }
}
```

---

## 3.2 · Danh sách Pricing Rules

### `GET /admin/pricing-rules`

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `venue_id` | string | Lọc theo venue |
| `is_active` | boolean | Chỉ lấy rule đang hoạt động |

**Response 200:**

```json
{
  "data": {
    "rules": [
      {
        "rule_id": "pr_7a3c1f9e",
        "rule_name": "Giờ Vàng Cuối Tuần",
        "priority": 10,
        "is_active": true,
        "conditions_summary": "Thứ 7, CN · 17:00–21:00 · Lấp đầy ≥ 70%",
        "adjustment_summary": "+40% (tối đa 300.000đ)",
        "valid_from": "2025-07-01",
        "valid_to": "2025-12-31"
      }
    ]
  }
}
```

---

## 3.3 · Tính giá động và cập nhật Slot

### `POST /internal/pricing/calculate`

**Mô tả:** API nội bộ, chạy theo cron job (ví dụ mỗi 2 giờ) để tính lại giá slot.

**Headers:**
```
X-Internal-Service-Key: <secret-key>
Content-Type: application/json
```

**Request Body:**

```json
{
  "venue_id": "v_9f2a1b3c",
  "date": "2025-07-15",
  "slot_ids": ["s_001", "s_002", "s_010"]
}
```

**Response 200:**

```json
{
  "data": {
    "updated_count": 3,
    "results": [
      {
        "slot_id": "s_001",
        "old_price": 120000,
        "new_price": 168000,
        "rules_applied": ["Giờ Vàng Cuối Tuần"]
      },
      {
        "slot_id": "s_010",
        "old_price": 120000,
        "new_price": 96000,
        "rules_applied": ["Giảm giá giờ thấp điểm"]
      }
    ],
    "processed_at": "2025-07-15T06:00:05+07:00"
  }
}
```

**Luồng xử lý:**
```
1. Fetch tất cả PRICING_RULES đang active của venue
2. Fetch occupancy rate hiện tại của từng slot
3. Với mỗi slot:
   - Kiểm tra lần lượt các rule theo priority (cao → thấp)
   - Tìm rule khớp điều kiện → apply adjustment
   - Đảm bảo giá trong khoảng [floor_price, cap_price]
4. UPDATE SLOTS SET dynamic_price = :new_price, version = version + 1
   WHERE id IN (:slot_ids) AND status = 'available'
5. Trả kết quả
```

---

# PHÂN HỆ 4 — Analytics & SEO

---

## 4.1 · Heatmap tỷ lệ lấp đầy

### `GET /admin/analytics/occupancy-heatmap`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `venue_id` | string | ✅ | |
| `date_from` | date | ✅ | |
| `date_to` | date | ✅ | Tối đa 90 ngày |
| `sport_type` | string | ❌ | Lọc theo loại sân |

**Response 200:**

```json
{
  "data": {
    "venue_id": "v_9f2a1b3c",
    "period": {
      "from": "2025-07-01",
      "to": "2025-07-14"
    },
    "heatmap": [
      {
        "date": "2025-07-01",
        "day_of_week": "tuesday",
        "hourly_data": [
          { "hour": "06:00", "total_slots": 4, "booked": 1, "occupancy_rate": 0.25 },
          { "hour": "07:00", "total_slots": 4, "booked": 2, "occupancy_rate": 0.50 },
          { "hour": "08:00", "total_slots": 4, "booked": 4, "occupancy_rate": 1.00 },
          { "hour": "17:00", "total_slots": 4, "booked": 4, "occupancy_rate": 1.00 },
          { "hour": "21:00", "total_slots": 4, "booked": 0, "occupancy_rate": 0.00 }
        ],
        "daily_summary": {
          "total_slots": 64,
          "booked": 39,
          "occupancy_rate": 0.609,
          "revenue": 5040000
        }
      }
    ],
    "summary": {
      "avg_occupancy_rate": 0.624,
      "peak_hour": "08:00",
      "peak_day": "saturday",
      "lowest_hour": "13:00",
      "total_revenue": 62530000
    }
  }
}
```

---

## 4.2 · Thống kê doanh thu

### `GET /admin/analytics/revenue`

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `venue_id` | string | |
| `period` | string | `today` \| `week` \| `month` \| `year` \| `custom` |
| `date_from` | date | Khi period = custom |
| `date_to` | date | Khi period = custom |
| `group_by` | string | `day` \| `week` \| `month` \| `sport_type` |

**Response 200:**

```json
{
  "data": {
    "kpis": {
      "total_revenue": 42150000,
      "total_bookings": 287,
      "avg_booking_value": 146863,
      "cancellation_rate": 0.042,
      "avg_occupancy_rate": 0.624
    },
    "revenue_by_period": [
      { "label": "01/07", "revenue": 4200000, "bookings": 28 },
      { "label": "02/07", "revenue": 3800000, "bookings": 25 }
    ],
    "revenue_by_sport": [
      { "sport": "pickleball", "revenue": 28000000, "percentage": 66.4 },
      { "sport": "badminton", "revenue": 14150000, "percentage": 33.6 }
    ]
  }
}
```

---

## 4.3 · Schema JSON-LD cho SEO

### `GET /venues/{venue_id}/schema.json`

**Mô tả:** Trả về Schema.org JSON-LD cho từng venue, phục vụ Google Rich Results. Không cần auth. Có thể cache CDN.

**Response Headers:**
```
Content-Type: application/ld+json
Cache-Control: public, max-age=3600
```

**Response 200:**

```json
{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "Sân Pickleball Quận 7 Arena",
  "description": "Cụm sân Pickleball hiện đại tại Quận 7 TP.HCM.",
  "url": "https://sportscourt.vn/venues/san-pickleball-quan-7-arena",
  "telephone": "+84901234567",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Nguyễn Thị Thập",
    "addressLocality": "Quận 7",
    "addressRegion": "TP. Hồ Chí Minh",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.7301,
    "longitude": 106.7218
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "06:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday","Sunday"],
      "opens": "05:30",
      "closes": "23:00"
    }
  ],
  "priceRange": "80.000đ – 300.000đ/giờ",
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Bãi đỗ xe", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Phòng tắm", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cho thuê dụng cụ", "value": true }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.7,
    "reviewCount": 128,
    "bestRating": 5
  }
}
```

---

# PHÂN HỆ 5 — Security & Auth

---

## 5.1 · Đăng nhập

### `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "admin@arena-q7.vn",
  "password": "SecurePassword123!"
}
```

**Response 200 — Đăng nhập thành công:**

```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_9f3c1a7e2b...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "user_id": "u_admin_abc",
      "email": "admin@arena-q7.vn",
      "full_name": "Trần Thị B",
      "role": "manager",
      "permissions": [
        "slots:read", "slots:write",
        "bookings:read", "bookings:write",
        "analytics:read"
      ],
      "venue_ids": ["v_9f2a1b3c"],
      "mfa_enabled": true
    }
  }
}
```

**Response 200 — Cần xác thực MFA:**

```json
{
  "data": {
    "status": "mfa_required",
    "mfa_session_token": "mfa_sess_abc123",
    "mfa_methods": ["totp", "sms"],
    "message": "Vui lòng nhập mã OTP gửi đến số ***7890"
  }
}
```

**Response 401:**

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email hoặc mật khẩu không đúng.",
    "details": { "attempts_remaining": 3 }
  }
}
```

**Response 403 — Tài khoản bị khóa:**

```json
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Tài khoản bị khóa tạm thời do đăng nhập sai nhiều lần.",
    "details": { "locked_until": "2025-07-15T09:00:00+07:00" }
  }
}
```

**Luồng xử lý:**
```
1. Kiểm tra rate limit: 5 lần sai / 15 phút theo IP (lưu trong DB)
2. Tìm user theo email trong DB
3. So sánh password với bcrypt hash
4. Kiểm tra trạng thái tài khoản (active / locked)
5. Nếu user bật MFA → trả mfa_required + mfa_session_token
6. Nếu không có MFA → tạo access_token (JWT, RS256, TTL 1h) + refresh_token
7. Ghi lại last_login_at, last_login_ip vào DB
8. Trả response
```

---

## 5.2 · Xác thực MFA

### `POST /auth/mfa/verify`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**

```json
{
  "mfa_session_token": "mfa_sess_abc123",
  "otp_code": "847291",
  "mfa_method": "totp"
}
```

| Field | Kiểu | Mô tả |
|---|---|---|
| `mfa_session_token` | string | Token nhận từ bước login |
| `otp_code` | string | Mã OTP 6 chữ số |
| `mfa_method` | string | `totp` (Google Authenticator) \| `sms` |

**Response 200 — Xác thực thành công:**

```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_9f3c1a7e2b...",
    "expires_in": 3600
  }
}
```

**Response 401 — OTP sai:**

```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "Mã OTP không chính xác.",
    "details": { "attempts_remaining": 2 }
  }
}
```

**Response 429 — Quá nhiều lần thử:**

```json
{
  "error": {
    "code": "MFA_LOCKED",
    "message": "Xác thực MFA bị khóa 15 phút do nhập sai nhiều lần.",
    "details": { "locked_until": "2025-07-15T08:15:00+07:00" }
  }
}
```

---

## 5.3 · Refresh Token

### `POST /auth/token/refresh`

**Request Body:**

```json
{ "refresh_token": "rt_9f3c1a7e2b..." }
```

**Response 200:**

```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

**Response 401:**

```json
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token không hợp lệ hoặc đã hết hạn."
  }
}
```

---

## 5.4 · Đăng xuất

### `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "refresh_token": "rt_9f3c1a7e2b...",
  "logout_all_devices": false
}
```

**Response 200:**

```json
{ "message": "Đăng xuất thành công." }
```

---

## 5.5 · Phân quyền RBAC — Thay đổi role

### `PATCH /admin/users/{user_id}/role`

**Headers:**
```
Authorization: Bearer <token>   (role: owner)
X-MFA-Token: <6-digit OTP>
Content-Type: application/json
```

**Request Body:**

```json
{
  "new_role": "manager",
  "venue_ids": ["v_9f2a1b3c"],
  "reason": "Thăng chức nhân viên xuất sắc tháng 7"
}
```

**Response 200:**

```json
{
  "data": {
    "user_id": "u_staff_xyz",
    "old_role": "staff",
    "new_role": "manager",
    "venue_ids": ["v_9f2a1b3c"],
    "audit_log_id": "al_role_001"
  }
}
```

---

## 5.6 · Xem Audit Log

### `GET /admin/audit-logs`

**Headers:**
```
Authorization: Bearer <token>   (role: owner)
```

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `entity_type` | string | `SLOT` \| `BOOKING` \| `INVOICE` \| `USER` \| `PRICING_RULE` |
| `entity_id` | string | UUID của entity |
| `action` | string | `reschedule` \| `cancel` \| `login` \| `invoice_issued` |
| `performed_by` | string | user_id của admin |
| `date_from` | datetime | |
| `date_to` | datetime | |
| `page` | integer | |

**Response 200:**

```json
{
  "data": {
    "logs": [
      {
        "log_id": "al_9f3c1a",
        "entity_type": "SLOT",
        "entity_id": "s_001",
        "action": "reschedule",
        "old_value": { "slot_id": "s_001", "time": "08:00" },
        "new_value": { "slot_id": "s_010", "time": "10:00" },
        "performed_by": {
          "user_id": "u_admin_abc",
          "full_name": "Trần Thị B",
          "role": "manager"
        },
        "reason": "Khách yêu cầu đổi giờ",
        "ip_address": "14.225.x.x",
        "created_at": "2025-07-15T09:30:00+07:00"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 342,
      "total_pages": 18
    }
  }
}
```

---

# PHÂN HỆ 6 — Quản lý Venue & Court (B2B)

---

## 6.1 · Tạo Venue mới

### `POST /admin/venues`

**Headers:**
```
Authorization: Bearer <token>   (role: owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Sân Pickleball Quận 7 Arena",
  "description": "Cụm sân Pickleball hiện đại tại Quận 7 TP.HCM.",
  "address": "123 Nguyễn Thị Thập, Quận 7, TP.HCM",
  "lat": 10.7301,
  "lng": 106.7218,
  "phone": "0901234567",
  "email": "info@arena-q7.vn",
  "working_hours": {
    "weekday": { "open": "06:00", "close": "22:00" },
    "weekend": { "open": "05:30", "close": "23:00" }
  },
  "amenities": ["parking", "shower", "locker", "cafe"],
  "bank_account": {
    "bank_name": "Vietcombank",
    "account_number": "1234567890",
    "account_holder": "NGUYEN VAN A"
  }
}
```

**Response 201 — Thành công:**

```json
{
  "data": {
    "venue_id": "v_9f2a1b3c",
    "name": "Sân Pickleball Quận 7 Arena",
    "slug": "san-pickleball-quan-7-arena",
    "status": "active",
    "created_at": "2025-07-15T10:00:00+07:00"
  }
}
```

**Response 422 — Dữ liệu không hợp lệ:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ.",
    "details": { "lat": "Vĩ độ không nằm trong lãnh thổ Việt Nam." }
  }
}
```

---

## 6.2 · Cập nhật thông tin Venue

### `PUT /admin/venues/{venue_id}`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:** *(chỉ gửi các field cần thay đổi)*

```json
{
  "description": "Cụm sân mới nâng cấp, có mái che toàn bộ.",
  "working_hours": {
    "weekday": { "open": "05:30", "close": "23:00" },
    "weekend": { "open": "05:00", "close": "23:30" }
  },
  "amenities": ["parking", "shower", "locker", "cafe", "ac"]
}
```

**Response 200:**

```json
{
  "data": {
    "venue_id": "v_9f2a1b3c",
    "updated_fields": ["description", "working_hours", "amenities"],
    "updated_at": "2025-07-15T11:00:00+07:00"
  }
}
```

---

## 6.3 · Tạm đóng / Mở lại Venue

### `PATCH /admin/venues/{venue_id}/status`

**Headers:**
```
Authorization: Bearer <token>   (role: owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "closed",
  "reason": "Sửa chữa cơ sở hạ tầng",
  "reopen_at": "2025-07-20T06:00:00+07:00"
}
```

| Field | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `active` \| `closed` \| `suspended` |
| `reason` | string | Lý do thay đổi trạng thái |
| `reopen_at` | datetime | Dự kiến mở lại (nếu có) |

**Response 200:**

```json
{
  "data": {
    "venue_id": "v_9f2a1b3c",
    "old_status": "active",
    "new_status": "closed",
    "reopen_at": "2025-07-20T06:00:00+07:00",
    "affected_bookings": 12,
    "message": "Venue đã đóng. 12 booking sắp tới cần được xử lý."
  }
}
```

**Luồng xử lý:**
```
1. Kiểm tra JWT + RBAC (role: owner)
2. UPDATE VENUES SET status = :status WHERE id = :venue_id
3. Nếu status = 'closed':
   - Lấy danh sách BOOKINGS có date >= hôm nay thuộc venue này
   - Trả về affected_bookings để admin xử lý thủ công (hủy hoặc đổi lịch)
4. INSERT AUDIT_LOGS (action: 'venue_status_changed', reason)
5. Trả 200
```

---

## 6.4 · Tạo Court mới trong Venue

### `POST /admin/venues/{venue_id}/courts`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "court_name": "Sân B3",
  "sport_type": "pickleball",
  "description": "Sân tiêu chuẩn quốc tế, nền nhựa PVC",
  "base_price": 120000,
  "surface_type": "pvc",
  "has_lighting": true,
  "has_roof": true,
  "max_players": 4,
  "images": [
    "https://cdn.sportscourt.vn/courts/img1.jpg"
  ]
}
```

**Response 201:**

```json
{
  "data": {
    "court_id": "c_4d5e6f",
    "court_name": "Sân B3",
    "venue_id": "v_9f2a1b3c",
    "sport_type": "pickleball",
    "status": "active",
    "created_at": "2025-07-15T10:00:00+07:00"
  }
}
```

---

## 6.5 · Cập nhật Court

### `PUT /admin/courts/{court_id}`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "court_name": "Sân B3 (Nâng cấp)",
  "base_price": 140000,
  "has_lighting": true,
  "status": "active"
}
```

**Response 200:**

```json
{
  "data": {
    "court_id": "c_4d5e6f",
    "updated_fields": ["court_name", "base_price"],
    "updated_at": "2025-07-15T12:00:00+07:00"
  }
}
```

---

## 6.6 · Xóa Court

### `DELETE /admin/courts/{court_id}`

**Headers:**
```
Authorization: Bearer <token>   (role: owner)
```

**Response 200:**

```json
{
  "data": {
    "court_id": "c_4d5e6f",
    "deleted": true,
    "message": "Sân đã được xóa."
  }
}
```

**Response 409 — Có booking đang hoạt động:**

```json
{
  "error": {
    "code": "COURT_HAS_ACTIVE_BOOKINGS",
    "message": "Không thể xóa sân đang có lịch đặt. Vui lòng hủy các booking trước.",
    "details": { "active_bookings_count": 5 }
  }
}
```

---

# PHÂN HỆ 7 — Quản lý Slot hàng loạt (B2B)

---

## 7.1 · Tạo Slot hàng loạt theo lịch

### `POST /admin/courts/{court_id}/slots/bulk-generate`

**Mô tả:** Tự động tạo slot theo khung giờ và ngày lặp lại. Thay vì tạo từng slot, admin chỉ cần cấu hình một lần.

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "date_from": "2025-08-01",
  "date_to": "2025-08-31",
  "time_slots": [
    { "start": "06:00", "end": "07:00" },
    { "start": "07:00", "end": "08:00" },
    { "start": "08:00", "end": "09:00" },
    { "start": "09:00", "end": "10:00" },
    { "start": "17:00", "end": "18:00" },
    { "start": "18:00", "end": "19:00" },
    { "start": "19:00", "end": "20:00" },
    { "start": "20:00", "end": "21:00" }
  ],
  "apply_to_days": ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
  "base_price": 120000,
  "skip_existing": true
}
```

| Field | Kiểu | Mô tả |
|---|---|---|
| `date_from` / `date_to` | date | Khoảng thời gian tạo slot |
| `time_slots` | array | Danh sách các khung giờ |
| `apply_to_days` | string[] | Các ngày trong tuần áp dụng |
| `base_price` | integer | Giá gốc (VNĐ/slot) |
| `skip_existing` | boolean | Nếu `true`, bỏ qua slot đã tồn tại thay vì báo lỗi |

**Response 201:**

```json
{
  "data": {
    "court_id": "c_1a2b3c",
    "created_count": 248,
    "skipped_count": 0,
    "failed_count": 0,
    "date_range": {
      "from": "2025-08-01",
      "to": "2025-08-31"
    },
    "preview": [
      { "date": "2025-08-01", "start_time": "06:00", "end_time": "07:00", "price": 120000 },
      { "date": "2025-08-01", "start_time": "07:00", "end_time": "08:00", "price": 120000 }
    ],
    "message": "Tạo thành công 248 slot cho tháng 8/2025."
  }
}
```

**Response 409 — Slot đã tồn tại (khi skip_existing = false):**

```json
{
  "error": {
    "code": "SLOTS_ALREADY_EXIST",
    "message": "Đã có 16 slot tồn tại trong khoảng thời gian này.",
    "details": { "existing_count": 16 }
  }
}
```

**Luồng xử lý:**
```
1. Validate date_from <= date_to, tối đa 3 tháng/lần
2. Tính toán tất cả (date, time_slot) pairs trong khoảng
3. Lọc theo apply_to_days
4. Kiểm tra slot đã tồn tại trong DB
5. Nếu skip_existing = false và có slot trùng → trả 409
6. INSERT INTO SLOTS (batch insert) các slot chưa tồn tại
7. Trả số lượng created / skipped
```

---

## 7.2 · Cập nhật giá hàng loạt

### `PATCH /admin/courts/{court_id}/slots/bulk-update-price`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "date_from": "2025-08-01",
  "date_to": "2025-08-31",
  "time_from": "17:00",
  "time_to": "21:00",
  "apply_to_days": ["saturday", "sunday"],
  "new_price": 180000
}
```

**Response 200:**

```json
{
  "data": {
    "updated_count": 64,
    "new_price": 180000,
    "message": "Đã cập nhật giá cho 64 slot."
  }
}
```

---

## 7.3 · Đặt trạng thái Maintenance hàng loạt

### `PATCH /admin/courts/{court_id}/slots/bulk-set-status`

**Mô tả:** Đóng/mở nhiều slot cùng lúc, ví dụ khi sân cần bảo trì.

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "date_from": "2025-07-20",
  "date_to": "2025-07-22",
  "time_from": "06:00",
  "time_to": "22:00",
  "new_status": "maintenance",
  "reason": "Thay mặt sân và căng lại lưới"
}
```

| Field | Kiểu | Mô tả |
|---|---|---|
| `new_status` | string | `available` \| `maintenance` \| `closed` |
| `reason` | string | Lý do (bắt buộc khi đổi sang maintenance/closed) |

**Response 200:**

```json
{
  "data": {
    "updated_count": 32,
    "skipped_booked_count": 3,
    "new_status": "maintenance",
    "message": "Đã cập nhật 32 slot. Bỏ qua 3 slot đã có booking."
  }
}
```

**Luồng xử lý:**
```
1. SELECT các slot trong khoảng thời gian, status != 'booked'
2. UPDATE SLOTS SET status = :new_status WHERE id IN (...)
3. Đếm riêng slot bị bỏ qua (đã có booking)
4. INSERT AUDIT_LOGS (action: 'bulk_status_update', reason)
5. Trả kết quả
```

---

## 7.4 · Xem danh sách Slot của một Court

### `GET /admin/courts/{court_id}/slots`

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `date_from` | date | ✅ |
| `date_to` | date | ✅ Tối đa +31 ngày |
| `status` | string | `available` \| `booked` \| `locked` \| `maintenance` |

**Response 200:**

```json
{
  "data": {
    "court_id": "c_1a2b3c",
    "slots": [
      {
        "slot_id": "s_001",
        "date": "2025-08-01",
        "start_time": "08:00",
        "end_time": "09:00",
        "status": "available",
        "base_price": 120000,
        "dynamic_price": 150000,
        "version": 2
      }
    ],
    "pagination": { "page": 1, "total": 248, "total_pages": 13 }
  }
}
```

---

# PHÂN HỆ 8 — Quản lý Booking (B2B)

---

## 8.1 · Danh sách Booking của Venue

### `GET /admin/venues/{venue_id}/bookings`

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
```

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `date_from` | date | |
| `date_to` | date | |
| `status` | string | `pending` \| `confirmed` \| `cancelled` \| `completed` |
| `payment_status` | string | `unpaid` \| `paid` \| `refunded` |
| `search` | string | Tìm theo tên, SĐT, booking_id |
| `sport_type` | string | |
| `court_id` | string | |
| `page` | integer | Default: `1` |
| `limit` | integer | Default: `20` |

**Response 200:**

```json
{
  "data": {
    "bookings": [
      {
        "booking_id": "bk_xyz789",
        "customer": {
          "user_id": "u_abc123",
          "full_name": "Nguyễn Văn A",
          "phone": "0901234567"
        },
        "court": {
          "court_id": "c_1a2b3c",
          "court_name": "Sân A1",
          "sport_type": "pickleball"
        },
        "slot": {
          "date": "2025-07-15",
          "start_time": "08:00",
          "end_time": "09:00"
        },
        "booking_type": "single",
        "status": "confirmed",
        "total_amount": 150000,
        "payment_status": "paid",
        "has_add_ons": true,
        "has_delivery": false,
        "created_at": "2025-07-14T20:15:00+07:00"
      }
    ],
    "pagination": { "page": 1, "total": 287, "total_pages": 15 },
    "summary": {
      "total_confirmed": 241,
      "total_cancelled": 12,
      "total_pending": 34,
      "total_revenue": 36150000
    }
  }
}
```

---

## 8.2 · Chi tiết một Booking

### `GET /admin/bookings/{booking_id}`

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
```

**Response 200:**

```json
{
  "data": {
    "booking_id": "bk_xyz789",
    "customer": {
      "user_id": "u_abc123",
      "full_name": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@email.com",
      "total_bookings": 12
    },
    "court": {
      "court_id": "c_1a2b3c",
      "court_name": "Sân A1",
      "venue_name": "Sân Pickleball Quận 7 Arena",
      "sport_type": "pickleball"
    },
    "slot": {
      "slot_id": "s_001",
      "date": "2025-07-15",
      "start_time": "08:00",
      "end_time": "09:00"
    },
    "booking_type": "single",
    "status": "confirmed",
    "payment": {
      "method": "momo",
      "status": "paid",
      "amount": 150000,
      "transaction_id": "3086823480",
      "paid_at": "2025-07-14T20:20:00+07:00"
    },
    "add_ons": [
      {
        "product_id": "p_racket_001",
        "name": "Vợt Pickleball Starter",
        "quantity": 2,
        "unit_price": 50000,
        "subtotal": 100000
      }
    ],
    "delivery": {
      "status": "delivered",
      "address": "123 Lê Văn Lương, Quận 7",
      "ahamove_order_id": "ahm_ord_9f3c",
      "delivered_at": "2025-07-15T07:35:00+07:00"
    },
    "invoice": {
      "invoice_id": "inv_001",
      "misa_invoice_no": "0000123",
      "pdf_url": "https://misa.vn/invoices/0000123.pdf"
    },
    "notes": "Cần thêm ghế ngồi",
    "created_at": "2025-07-14T20:15:00+07:00"
  }
}
```

---

## 8.3 · Hủy Booking (Admin)

### `POST /admin/bookings/{booking_id}/cancel`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Sân gặp sự cố kỹ thuật, không thể phục vụ",
  "refund_policy": "full",
  "notify_customer": true
}
```

| Field | Kiểu | Mô tả |
|---|---|---|
| `reason` | string | Lý do hủy (lưu audit log) |
| `refund_policy` | string | `full` \| `partial` \| `none` |
| `refund_amount` | integer | Bắt buộc nếu `refund_policy = partial` |
| `notify_customer` | boolean | Gửi thông báo cho khách |

**Response 200:**

```json
{
  "data": {
    "booking_id": "bk_xyz789",
    "status": "cancelled",
    "refund": {
      "policy": "full",
      "amount": 150000,
      "method": "momo",
      "estimated_refund_time": "3–5 ngày làm việc"
    },
    "customer_notified": true,
    "audit_log_id": "al_cancel_001"
  }
}
```

**Response 409 — Booking không thể hủy:**

```json
{
  "error": {
    "code": "BOOKING_NOT_CANCELLABLE",
    "message": "Booking đã hoàn thành, không thể hủy.",
    "details": { "current_status": "completed" }
  }
}
```

**Luồng xử lý:**
```
1. Kiểm tra JWT + RBAC (role >= manager)
2. Kiểm tra booking status hợp lệ để hủy (pending | confirmed)
3. BEGIN TRANSACTION
4. UPDATE BOOKINGS SET status = 'cancelled'
5. UPDATE SLOTS SET status = 'available', version = version + 1
6. Nếu refund_policy != 'none':
   - Gọi MoMo/ZaloPay Refund API
   - INSERT INTO TRANSACTIONS (type='refund', amount=:refund_amount)
7. INSERT AUDIT_LOGS (action: 'booking_cancelled', reason, performed_by)
8. COMMIT
9. Nếu notify_customer = true → gửi SMS + Email
10. Trả 200
```

---

## 8.4 · Check-in Booking

### `POST /admin/bookings/{booking_id}/checkin`

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "checkin_method": "qr_scan",
  "note": ""
}
```

| Field | Mô tả |
|---|---|
| `checkin_method` | `qr_scan` \| `manual` |

**Response 200:**

```json
{
  "data": {
    "booking_id": "bk_xyz789",
    "checkin_status": "checked_in",
    "checkin_at": "2025-07-15T07:58:00+07:00",
    "checkin_by": "u_staff_xyz",
    "customer_name": "Nguyễn Văn A",
    "slot": {
      "court_name": "Sân A1",
      "start_time": "08:00",
      "end_time": "09:00"
    }
  }
}
```

---

## 8.5 · Tạo Booking thủ công (Walk-in)

### `POST /admin/bookings/walk-in`

**Mô tả:** Admin tạo booking trực tiếp cho khách đến tại sân, không cần đặt qua app.

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "slot_id": "s_002",
  "expected_version": 3,
  "customer": {
    "full_name": "Trần Thị C",
    "phone": "0912345678",
    "user_id": null
  },
  "payment_method": "cash",
  "amount_paid": 120000,
  "notes": "Khách vãng lai"
}
```

**Response 201:**

```json
{
  "data": {
    "booking_id": "bk_walkin_001",
    "status": "confirmed",
    "payment_status": "paid",
    "slot": {
      "court_name": "Sân A1",
      "date": "2025-07-15",
      "start_time": "09:00",
      "end_time": "10:00"
    },
    "receipt_no": "RC20250715001"
  }
}
```

---

# PHÂN HỆ 9 — Quản lý Sản phẩm / Dụng cụ cho thuê (B2B)

---

## 9.1 · Danh sách sản phẩm

### `GET /admin/venues/{venue_id}/products`

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
```

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `category` | string | `racket` \| `ball` \| `shoes` \| `accessory` |
| `is_available` | boolean | Lọc sản phẩm còn hàng |
| `page` | integer | Default: `1` |

**Response 200:**

```json
{
  "data": {
    "products": [
      {
        "product_id": "p_racket_001",
        "name": "Vợt Pickleball Starter",
        "category": "racket",
        "description": "Vợt dành cho người mới, trọng lượng nhẹ",
        "rental_price": 50000,
        "stock_total": 10,
        "stock_available": 7,
        "images": ["https://cdn.sportscourt.vn/products/racket_001.jpg"],
        "is_available": true
      }
    ],
    "pagination": { "page": 1, "total": 15, "total_pages": 1 }
  }
}
```

---

## 9.2 · Tạo sản phẩm mới

### `POST /admin/venues/{venue_id}/products`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Vợt Pickleball Pro",
  "category": "racket",
  "description": "Vợt carbon cao cấp cho người chơi trung-nâng cao",
  "rental_price": 80000,
  "stock_quantity": 5,
  "sport_type": "pickleball",
  "images": ["https://cdn.sportscourt.vn/products/racket_pro.jpg"]
}
```

**Response 201:**

```json
{
  "data": {
    "product_id": "p_racket_002",
    "name": "Vợt Pickleball Pro",
    "stock_quantity": 5,
    "created_at": "2025-07-15T10:00:00+07:00"
  }
}
```

---

## 9.3 · Cập nhật sản phẩm

### `PUT /admin/products/{product_id}`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "rental_price": 90000,
  "stock_quantity": 8,
  "is_available": true,
  "description": "Mô tả mới cập nhật"
}
```

**Response 200:**

```json
{
  "data": {
    "product_id": "p_racket_002",
    "updated_fields": ["rental_price", "stock_quantity"],
    "updated_at": "2025-07-15T11:00:00+07:00"
  }
}
```

---

## 9.4 · Điều chỉnh tồn kho

### `POST /admin/products/{product_id}/adjust-stock`

**Mô tả:** Ghi nhận nhập kho, xuất kho, hoặc điều chỉnh sau kiểm kê.

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "adjustment_type": "add",
  "quantity": 3,
  "reason": "Nhập thêm hàng từ nhà cung cấp"
}
```

| Field | Mô tả |
|---|---|
| `adjustment_type` | `add` (nhập kho) \| `subtract` (xuất/hỏng) \| `set` (đặt lại chính xác) |
| `quantity` | Số lượng điều chỉnh |

**Response 200:**

```json
{
  "data": {
    "product_id": "p_racket_002",
    "old_stock": 5,
    "adjustment": 3,
    "new_stock": 8,
    "reason": "Nhập thêm hàng từ nhà cung cấp",
    "adjusted_at": "2025-07-15T10:30:00+07:00"
  }
}
```

---

## 9.5 · Xóa sản phẩm

### `DELETE /admin/products/{product_id}`

**Headers:**
```
Authorization: Bearer <token>   (role: owner)
```

**Response 200:**

```json
{ "data": { "product_id": "p_racket_002", "deleted": true } }
```

**Response 409 — Sản phẩm đang được thuê:**

```json
{
  "error": {
    "code": "PRODUCT_IN_USE",
    "message": "Sản phẩm đang có trong các đơn hàng chưa hoàn thành.",
    "details": { "active_orders_count": 2 }
  }
}
```

---

# PHÂN HỆ 10 — Quản lý Đánh giá & Phản hồi (B2B)

---

## 10.1 · Danh sách đánh giá của Venue

### `GET /admin/venues/{venue_id}/reviews`

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
```

**Query Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `rating` | integer | Lọc theo sao (1–5) |
| `status` | string | `published` \| `hidden` \| `pending` |
| `has_reply` | boolean | Lọc theo đã/chưa trả lời |
| `date_from` | date | |
| `date_to` | date | |
| `page` | integer | Default: `1` |

**Response 200:**

```json
{
  "data": {
    "reviews": [
      {
        "review_id": "rv_001",
        "booking_id": "bk_xyz789",
        "customer": {
          "user_id": "u_abc123",
          "full_name": "Nguyễn Văn A",
          "avatar_url": "https://cdn.sportscourt.vn/avatars/u_abc123.jpg"
        },
        "rating": 5,
        "comment": "Sân đẹp, nhân viên thân thiện, đặt sân online rất tiện.",
        "images": [],
        "status": "published",
        "reply": null,
        "created_at": "2025-07-15T10:00:00+07:00"
      },
      {
        "review_id": "rv_002",
        "booking_id": "bk_abc456",
        "customer": {
          "user_id": "u_def456",
          "full_name": "Lê Thị B"
        },
        "rating": 3,
        "comment": "Sân ok nhưng tủ khóa hơi cũ.",
        "images": [],
        "status": "published",
        "reply": {
          "content": "Cảm ơn bạn đã góp ý! Chúng tôi đang lên kế hoạch thay tủ khóa mới trong tháng tới.",
          "replied_by": "Trần Thị B (Manager)",
          "replied_at": "2025-07-16T09:00:00+07:00"
        },
        "created_at": "2025-07-14T18:00:00+07:00"
      }
    ],
    "pagination": { "page": 1, "total": 128, "total_pages": 7 },
    "summary": {
      "avg_rating": 4.7,
      "total_reviews": 128,
      "rating_distribution": {
        "5": 89,
        "4": 24,
        "3": 10,
        "2": 3,
        "1": 2
      },
      "reply_rate": 0.72
    }
  }
}
```

---

## 10.2 · Trả lời đánh giá

### `POST /admin/reviews/{review_id}/reply`

**Headers:**
```
Authorization: Bearer <token>   (role: staff | manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Cảm ơn bạn đã ghé sân! Chúng tôi sẽ cải thiện trong thời gian sớm nhất."
}
```

**Response 201:**

```json
{
  "data": {
    "review_id": "rv_001",
    "reply": {
      "content": "Cảm ơn bạn đã ghé sân! Chúng tôi sẽ cải thiện trong thời gian sớm nhất.",
      "replied_by": "Trần Thị B",
      "replied_at": "2025-07-16T09:00:00+07:00"
    }
  }
}
```

**Response 409 — Đã có phản hồi:**

```json
{
  "error": {
    "code": "REPLY_ALREADY_EXISTS",
    "message": "Đánh giá này đã được trả lời. Dùng API cập nhật để chỉnh sửa."
  }
}
```

---

## 10.3 · Chỉnh sửa phản hồi

### `PUT /admin/reviews/{review_id}/reply`

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Cảm ơn bạn rất nhiều! Tủ khóa mới đã được lắp đặt từ 20/07. Mời bạn quay lại!"
}
```

**Response 200:**

```json
{
  "data": {
    "review_id": "rv_002",
    "reply": {
      "content": "Cảm ơn bạn rất nhiều! Tủ khóa mới đã được lắp đặt từ 20/07. Mời bạn quay lại!",
      "updated_at": "2025-07-20T10:00:00+07:00"
    }
  }
}
```

---

## 10.4 · Ẩn / Khôi phục đánh giá

### `PATCH /admin/reviews/{review_id}/status`

**Mô tả:** Admin có thể ẩn các đánh giá vi phạm chính sách (spam, ngôn ngữ không phù hợp).

**Headers:**
```
Authorization: Bearer <token>   (role: manager | owner)
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "hidden",
  "reason": "Nội dung vi phạm chính sách cộng đồng"
}
```

| Field | Mô tả |
|---|---|
| `status` | `published` \| `hidden` |
| `reason` | Lý do (bắt buộc khi ẩn) |

**Response 200:**

```json
{
  "data": {
    "review_id": "rv_003",
    "old_status": "published",
    "new_status": "hidden",
    "audit_log_id": "al_review_001"
  }
}
```

---

# 📎 Phụ lục — Bảng mã lỗi

| HTTP Code | Error Code | Mô tả |
|---|---|---|
| `400` | `INVALID_COORDINATES` | Tọa độ GPS không hợp lệ |
| `400` | `INVALID_DATE_RANGE` | Khoảng ngày không hợp lệ |
| `400` | `LOCK_EXPIRED` | Lock token hết hạn |
| `401` | `INVALID_CREDENTIALS` | Sai email/password |
| `401` | `TOKEN_EXPIRED` | JWT hết hạn |
| `401` | `INVALID_OTP` | Mã OTP không đúng |
| `403` | `INSUFFICIENT_PERMISSIONS` | Không đủ quyền RBAC |
| `403` | `ACCOUNT_LOCKED` | Tài khoản bị khóa |
| `404` | `VENUE_NOT_FOUND` | Không tìm thấy venue |
| `404` | `SLOT_NOT_FOUND` | Không tìm thấy slot |
| `409` | `SLOT_VERSION_CONFLICT` | Optimistic lock thất bại |
| `409` | `SLOT_UNAVAILABLE` | Slot đã được đặt |
| `429` | `RATE_LIMIT_EXCEEDED` | Quá nhiều request |
| `429` | `MFA_LOCKED` | MFA bị khóa tạm thời |
| `500` | `INTERNAL_ERROR` | Lỗi server |
| `502` | `PAYMENT_GATEWAY_ERROR` | Lỗi cổng thanh toán |
| `409` | `COURT_HAS_ACTIVE_BOOKINGS` | Court còn booking, không thể xóa |
| `409` | `SLOTS_ALREADY_EXIST` | Slot đã tồn tại khi tạo hàng loạt |
| `409` | `BOOKING_NOT_CANCELLABLE` | Booking không thể hủy |
| `409` | `PRODUCT_IN_USE` | Sản phẩm đang trong đơn hàng |
| `409` | `REPLY_ALREADY_EXISTS` | Đánh giá đã có phản hồi |
| `422` | `VALIDATION_ERROR` | Dữ liệu không hợp lệ |

---

# 📋 Danh sách tất cả Endpoints

**B2C Platform**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/venues/nearby` | Tìm sân gần đây | Optional |
| GET | `/venues/{venue_id}/slots` | Xem lịch trống | Optional |
| POST | `/slots/{slot_id}/lock` | Khóa slot | ✅ User |
| POST | `/checkouts` | Tạo đơn & thanh toán | ✅ User |
| GET | `/venues/{venue_id}/schema.json` | SEO JSON-LD | ❌ Public |

**Smart Admin Panel**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/admin/venues/{venue_id}/calendar` | Xem lịch grid | ✅ Staff+ |
| PATCH | `/admin/slots/{slot_id}` | Đổi lịch / cập nhật slot | ✅ Manager+ |
| GET | `/admin/invoices` | Danh sách hóa đơn | ✅ Manager+ |
| POST | `/webhooks/payment/{provider}` | Nhận callback thanh toán | Signature |

**AI Dynamic Pricing**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/admin/pricing-rules` | Tạo pricing rule | ✅ Owner |
| GET | `/admin/pricing-rules` | Danh sách pricing rules | ✅ Manager+ |
| POST | `/internal/pricing/calculate` | Tính giá động (internal) | Service Key |

**Analytics & SEO**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/admin/analytics/occupancy-heatmap` | Heatmap lấp đầy | ✅ Manager+ |
| GET | `/admin/analytics/revenue` | Thống kê doanh thu | ✅ Manager+ |

**Security & Auth**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/auth/login` | Đăng nhập | ❌ Public |
| POST | `/auth/mfa/verify` | Xác thực OTP | ❌ Public |
| POST | `/auth/token/refresh` | Làm mới token | ❌ Public |
| POST | `/auth/logout` | Đăng xuất | ✅ User |
| PATCH | `/admin/users/{user_id}/role` | Thay đổi role | ✅ Owner + MFA |
| GET | `/admin/audit-logs` | Xem lịch sử thao tác | ✅ Owner |

**Quản lý Venue & Court**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/admin/venues` | Tạo venue mới | ✅ Owner |
| PUT | `/admin/venues/{venue_id}` | Cập nhật thông tin venue | ✅ Manager+ |
| PATCH | `/admin/venues/{venue_id}/status` | Đóng / mở lại venue | ✅ Owner |
| POST | `/admin/venues/{venue_id}/courts` | Tạo court mới | ✅ Manager+ |
| PUT | `/admin/courts/{court_id}` | Cập nhật court | ✅ Manager+ |
| DELETE | `/admin/courts/{court_id}` | Xóa court | ✅ Owner |

**Quản lý Slot hàng loạt**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/admin/courts/{court_id}/slots/bulk-generate` | Tạo slot theo lịch | ✅ Manager+ |
| PATCH | `/admin/courts/{court_id}/slots/bulk-update-price` | Cập nhật giá hàng loạt | ✅ Manager+ |
| PATCH | `/admin/courts/{court_id}/slots/bulk-set-status` | Đặt trạng thái hàng loạt | ✅ Manager+ |
| GET | `/admin/courts/{court_id}/slots` | Danh sách slot của court | ✅ Staff+ |

**Quản lý Booking**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/admin/venues/{venue_id}/bookings` | Danh sách booking | ✅ Staff+ |
| GET | `/admin/bookings/{booking_id}` | Chi tiết booking | ✅ Staff+ |
| POST | `/admin/bookings/{booking_id}/cancel` | Hủy booking | ✅ Manager+ |
| POST | `/admin/bookings/{booking_id}/checkin` | Check-in | ✅ Staff+ |
| POST | `/admin/bookings/walk-in` | Tạo booking walk-in | ✅ Staff+ |

**Quản lý Sản phẩm / Dụng cụ**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/admin/venues/{venue_id}/products` | Danh sách sản phẩm | ✅ Staff+ |
| POST | `/admin/venues/{venue_id}/products` | Tạo sản phẩm mới | ✅ Manager+ |
| PUT | `/admin/products/{product_id}` | Cập nhật sản phẩm | ✅ Manager+ |
| POST | `/admin/products/{product_id}/adjust-stock` | Điều chỉnh tồn kho | ✅ Manager+ |
| DELETE | `/admin/products/{product_id}` | Xóa sản phẩm | ✅ Owner |

**Quản lý Đánh giá**

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/admin/venues/{venue_id}/reviews` | Danh sách đánh giá | ✅ Staff+ |
| POST | `/admin/reviews/{review_id}/reply` | Trả lời đánh giá | ✅ Staff+ |
| PUT | `/admin/reviews/{review_id}/reply` | Chỉnh sửa phản hồi | ✅ Manager+ |
| PATCH | `/admin/reviews/{review_id}/status` | Ẩn / khôi phục đánh giá | ✅ Manager+ |