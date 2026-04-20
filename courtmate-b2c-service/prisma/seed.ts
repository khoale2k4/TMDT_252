import prisma from '../src/config/prisma'; 

async function main() {
  console.log('Bắt đầu làm sạch database...');
  // Phải xóa Booking và Slot trước để không bị lỗi khóa ngoại (Foreign Key)
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.court.deleteMany();
  await prisma.venue.deleteMany();

  console.log('1. Đang nạp 10 Venue để test...');
  await prisma.venue.createMany({
    data: [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Sân Cầu Lông Thống Nhất',
        address: '123 Thống Nhất, Gò Vấp, TP.HCM',
        lat: 10.8351, lng: 106.6661,
        sport_types: ['badminton'],
        amenities: ['wifi', 'parking', 'canteen'],
        min_price: 50000, max_price: 100000, rating_avg: 4.5, total_reviews: 120,
        cover_image_url: 'https://example.com/court1.jpg',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Sân Bóng Đá Chảo Lửa',
        address: '30 Phan Thúc Duyện, Tân Bình, TP.HCM',
        lat: 10.8037, lng: 106.6622,
        sport_types: ['football'],
        amenities: ['parking', 'water'],
        min_price: 150000, max_price: 300000, rating_avg: 4.2, total_reviews: 85,
        cover_image_url: 'https://example.com/court2.jpg',
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Sân Tennis Lan Anh',
        address: '291 Cách Mạng Tháng Tám, Quận 10, TP.HCM',
        lat: 10.7769, lng: 106.6698,
        sport_types: ['tennis'],
        amenities: ['wifi', 'parking', 'shower', 'canteen'],
        min_price: 200000, max_price: 500000, rating_avg: 4.8, total_reviews: 300,
        cover_image_url: 'https://example.com/court3.jpg',
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Tổ hợp Thể thao Hoa Lư',
        address: '2 Đinh Tiên Hoàng, Quận 1, TP.HCM',
        lat: 10.7876, lng: 106.7001,
        sport_types: ['basketball', 'badminton'],
        amenities: ['parking', 'canteen', 'locker'],
        min_price: 80000, max_price: 250000, rating_avg: 4.0, total_reviews: 450,
        cover_image_url: 'https://example.com/court4.jpg',
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Sân Tennis Phú Mỹ Hưng',
        address: 'Khu đô thị Phú Mỹ Hưng, Quận 7, TP.HCM',
        lat: 10.7294, lng: 106.7169,
        sport_types: ['tennis', 'pickleball'],
        amenities: ['wifi', 'parking', 'shower', 'canteen', 'vip_lounge'],
        min_price: 300000, max_price: 800000, rating_avg: 4.9, total_reviews: 150,
        cover_image_url: 'https://example.com/court5.jpg',
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Sân Bóng Đá Mini Thảo Điền',
        address: '12 Quốc Hương, Thảo Điền, Quận 2, TP.HCM',
        lat: 10.8041, lng: 106.7394,
        sport_types: ['football'],
        amenities: ['parking', 'water', 'shower'],
        min_price: 250000, max_price: 450000, rating_avg: 4.6, total_reviews: 210,
        cover_image_url: 'https://example.com/court6.jpg',
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Nhà Thi Đấu Rạch Miễu',
        address: '1 Hoa Phượng, Phú Nhuận, TP.HCM',
        lat: 10.7994, lng: 106.6806,
        sport_types: ['swimming', 'volleyball', 'badminton'],
        amenities: ['parking', 'locker', 'canteen'],
        min_price: 40000, max_price: 120000, rating_avg: 4.3, total_reviews: 890,
        cover_image_url: 'https://example.com/court7.jpg',
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        name: 'Sân Pickleball Chợ Lớn',
        address: 'Hùng Vương, Quận 5, TP.HCM',
        lat: 10.7540, lng: 106.6625,
        sport_types: ['pickleball'],
        amenities: ['wifi', 'parking', 'water'],
        min_price: 100000, max_price: 200000, rating_avg: 4.7, total_reviews: 55,
        cover_image_url: 'https://example.com/court8.jpg',
      },
      {
        id: '99999999-9999-9999-9999-999999999999',
        name: 'Sân Cầu Lông Làng Đại Học',
        address: 'Khu đô thị Đại học Quốc gia, Thủ Đức, TP.HCM',
        lat: 10.8755, lng: 106.8005,
        sport_types: ['badminton'],
        amenities: ['parking', 'water'],
        min_price: 30000, max_price: 70000, rating_avg: 4.1, total_reviews: 320,
        cover_image_url: 'https://example.com/court9.jpg',
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Sân Bóng Đá Dĩ An Center',
        address: 'Trung tâm hành chính Dĩ An, Bình Dương',
        lat: 10.9145, lng: 106.7725,
        sport_types: ['football'],
        amenities: ['parking', 'canteen', 'locker'],
        min_price: 120000, max_price: 250000, rating_avg: 4.4, total_reviews: 60,
        cover_image_url: 'https://example.com/court10.jpg',
      }
    ]
  });

  console.log('2. Đang tạo các Court (Sân nhỏ)...');
  await prisma.court.createMany({
    data: [
      { id: 'c_thongnhat_1', venue_id: '11111111-1111-1111-1111-111111111111', name: 'Sân Cầu Lông 1', sport_type: 'badminton' },
      { id: 'c_thongnhat_2', venue_id: '11111111-1111-1111-1111-111111111111', name: 'Sân Cầu Lông 2', sport_type: 'badminton' },
      { id: 'c_phumyhung_1', venue_id: '55555555-5555-5555-5555-555555555555', name: 'Sân Tennis VIP', sport_type: 'tennis' },
      { id: 'c_phumyhung_2', venue_id: '55555555-5555-5555-5555-555555555555', name: 'Sân Pickleball Chuẩn', sport_type: 'pickleball' },
      { id: 'c_dian_1', venue_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Sân 5 người A', sport_type: 'football' },
    ]
  });

  console.log('3. Đang tạo một hóa đơn (Booking) mẫu...');
  await prisma.booking.create({
    data: {
      id: 'booking_da_thanh_toan_123',
      user_id: 'user_123_test',
      status: 'paid',
      payment_method: 'momo',
      total_amount: 150000
    }
  });

  console.log('4. Đang tạo các Slot (Khung giờ trống) cho toàn bộ API...');
  
  // Set testDate là ngày hôm nay (today) để test API 5 cho tiện
  const today = new Date();
  const testDate = today.toISOString().split('T')[0];

  // Tính các mốc thời gian
  const lockedUntilTime = new Date();
  lockedUntilTime.setMinutes(lockedUntilTime.getMinutes() + 15);

  const validCheckoutTime = new Date();
  validCheckoutTime.setMinutes(validCheckoutTime.getMinutes() + 10);

  const expiredCheckoutTime = new Date();
  expiredCheckoutTime.setMinutes(expiredCheckoutTime.getMinutes() - 5);

  const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';

  await prisma.slot.createMany({
    data: [
      // --- SLOTS CỦA SÂN THỐNG NHẤT (DÙNG TEST API 5) ---
      { id: 's_1', court_id: 'c_thongnhat_1', date: testDate, start_time: '18:00', end_time: '19:00', status: 'available', price: 60000, version: 1 },
      { id: 's_2', court_id: 'c_thongnhat_1', date: testDate, start_time: '19:00', end_time: '20:00', status: 'booked', price: 60000, version: 2, booking_id: 'booking_da_thanh_toan_123' },
      
      // --- SLOTS CỦA SÂN PHÚ MỸ HƯNG ---
      { id: 's_3', court_id: 'c_phumyhung_1', date: testDate, start_time: '06:00', end_time: '07:00', status: 'available', price: 300000, version: 1 }, 
      { id: 's_4', court_id: 'c_phumyhung_2', date: testDate, start_time: '07:00', end_time: '08:00', status: 'available', price: 150000, version: 1 }, 
      
      // --- SLOTS CỦA SÂN DĨ AN ---
      { id: 's_5', court_id: 'c_dian_1', date: testDate, start_time: '19:00', end_time: '20:30', status: 'available', price: 250000, version: 1 },

      // --- SLOTS ĐỂ TEST API 3 (LOCK SLOT) ---
      { id: 's_api3_success', court_id: 'c_thongnhat_2', date: testDate, start_time: '08:00', end_time: '09:00', status: 'available', price: 60000, version: 1 },
      { id: 's_api3_locked', court_id: 'c_thongnhat_2', date: testDate, start_time: '09:00', end_time: '10:00', status: 'locked', price: 60000, version: 2, locked_by: 'user_khac', locked_until: lockedUntilTime },
      { id: 's_api3_conflict', court_id: 'c_thongnhat_2', date: testDate, start_time: '10:00', end_time: '11:00', status: 'available', price: 60000, version: 5 },

      // --- SLOTS ĐỂ TEST API 4 (CHECKOUT) ---
      { 
        id: 's_api4_ready', 
        court_id: 'c_thongnhat_2', 
        date: testDate, 
        start_time: '14:00', 
        end_time: '15:00', 
        status: 'locked', 
        price: 150000, 
        version: 2,
        locked_by: MOCK_USER_ID, 
        locked_until: validCheckoutTime,
        lock_token: 'valid_token_777' 
      },
      { 
        id: 's_api4_expired', 
        court_id: 'c_thongnhat_2', 
        date: testDate, 
        start_time: '15:00', 
        end_time: '16:00', 
        status: 'locked', 
        price: 150000, 
        version: 2,
        locked_by: MOCK_USER_ID,
        locked_until: expiredCheckoutTime, 
        lock_token: 'expired_token_888'
      },
      { 
        id: 's_api4_wrong_token', 
        court_id: 'c_thongnhat_2', 
        date: testDate, 
        start_time: '16:00', 
        end_time: '17:00', 
        status: 'locked', 
        price: 150000, 
        version: 2,
        locked_by: MOCK_USER_ID,
        locked_until: validCheckoutTime, 
        lock_token: 'token_that_999' 
      }
    ]
  });

  console.log('✅ SEED HOÀN TẤT!');
  console.log('\n======================================================');
  console.log('📌 COPY CÁC LINK SAU DÁN VÀO POSTMAN ĐỂ TEST API 5:');
  console.log('======================================================\n');
  
  console.log('👉 Test 1: Xem chi tiết Sân Cầu Lông Thống Nhất (Sẽ có 8 Slots)');
  console.log(`GET http://localhost:3000/v1/venues/11111111-1111-1111-1111-111111111111\n`);
  
  console.log('👉 Test 2: Xem chi tiết Sân Phú Mỹ Hưng (Sẽ có 2 Slots)');
  console.log(`GET http://localhost:3000/v1/venues/55555555-5555-5555-5555-555555555555\n`);

  console.log('👉 Test 3: Xem chi tiết sân có kèm ngày (Truyền ngày hiện tại của bạn vào)');
  console.log(`GET http://localhost:3000/v1/venues/11111111-1111-1111-1111-111111111111?date=${testDate}\n`);
  
  console.log('👉 Test 4: Bắn ID sai (Sẽ ra lỗi 404)');
  console.log(`GET http://localhost:3000/v1/venues/id_nay_khong_ton_tai_dau\n`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });