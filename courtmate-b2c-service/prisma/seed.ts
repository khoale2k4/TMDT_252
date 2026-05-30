import prisma from '../src/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🧹 Bắt đầu làm sạch database...');
  
  // Xóa theo thứ tự quan hệ khóa ngoại
  await prisma.invoice.deleteMany();
  await prisma.review.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.court.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 1. Đang tạo 6 Chủ sân (Owners) & 3 Khách hàng (Users) với UUID chuẩn...');
  const hashedPass = bcrypt.hashSync('password123', 10);
  
  const ownersData = [
    { id: 'a0000000-0000-0000-0000-000000000001', email: 'owner@courtmate.vn', name: 'Phạm Minh Chủ', phone: '0901234567' },
    { id: 'a0000000-0000-0000-0000-000000000010', email: 'vyowner@courtmate.vn', name: 'Trần Thị Vy', phone: '0908888888' },
    { id: 'a0000000-0000-0000-0000-000000000011', email: 'hoangowner@courtmate.vn', name: 'Nguyễn Văn Hoàng', phone: '0909999999' },
    { id: 'a0000000-0000-0000-0000-000000000012', email: 'sonowner@courtmate.vn', name: 'Lê Hoàng Sơn', phone: '0907777777' },
    { id: 'a0000000-0000-0000-0000-000000000013', email: 'dungowner@courtmate.vn', name: 'Bùi Thị Dung', phone: '0906666666' },
    { id: 'a0000000-0000-0000-0000-000000000014', email: 'ducowner@courtmate.vn', name: 'Vũ Minh Đức', phone: '0905555555' },
  ];

  const owners = [];
  for (const o of ownersData) {
    const created = await prisma.user.create({
      data: {
        id: o.id,
        email: o.email,
        password: hashedPass,
        full_name: o.name,
        role: 'owner',
        phone: o.phone
      }
    });
    owners.push(created);
  }

  // Khách hàng
  const user1 = await prisma.user.create({
    data: { id: 'a0000000-0000-0000-0000-000000000002', email: 'khoa@courtmate.vn', password: hashedPass, full_name: 'Nguyễn Lê Khoa', role: 'user', phone: '0987654321' }
  });
  const user2 = await prisma.user.create({
    data: { id: 'a0000000-0000-0000-0000-000000000003', email: 'vanb@courtmate.vn', password: hashedPass, full_name: 'Trần Văn B', role: 'user', phone: '0911223344' }
  });
  const user3 = await prisma.user.create({
    data: { id: 'a0000000-0000-0000-0000-000000000004', email: 'thuyc@courtmate.vn', password: hashedPass, full_name: 'Lê Thị Thùy C', role: 'user', phone: '0933445566' }
  });

  const users = [user1, user2, user3];

  console.log('🏟️ 2. Đang tạo 13 Cụm sân (Venues) vô cùng đa dạng khắp TP.HCM...');

  const venuesData = [
    { id: 'b0000000-0000-0000-0000-000000000001', name: 'Sân Tennis Phú Mỹ Hưng', address: 'Khu đô thị Phú Mỹ Hưng, Quận 7, TP.HCM', lat: 10.7294, lng: 106.7169, sports: ['tennis', 'pickleball'], amenities: ['wifi', 'parking', 'shower', 'canteen'], min: 150000, max: 450000, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000001' },
    { id: 'b0000000-0000-0000-0000-000000000002', name: 'Sân Cầu Lông Thống Nhất', address: '123 Thống Nhất, Gò Vấp, TP.HCM', lat: 10.8351, lng: 106.6661, sports: ['badminton'], amenities: ['parking', 'canteen', 'wifi'], min: 50000, max: 120000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000001' },
    { id: 'b0000000-0000-0000-0000-000000000003', name: 'Sân Pickleball Chợ Lớn', address: 'Hùng Vương, Quận 5, TP.HCM', lat: 10.7540, lng: 106.6625, sports: ['pickleball'], amenities: ['wifi', 'parking', 'water'], min: 100000, max: 200000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000001' },
    
    // 10 Sân mới
    { id: 'b0000000-0000-0000-0000-000000000004', name: 'Sân Cầu Lông Lan Anh', address: '291 Cách Mạng Tháng Tám, Quận 10, TP.HCM', lat: 10.7769, lng: 106.6698, sports: ['badminton'], amenities: ['wifi', 'parking', 'canteen', 'shower'], min: 60000, max: 110000, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000010' },
    { id: 'b0000000-0000-0000-0000-000000000005', name: 'Sân Pickleball Hoa Lư', address: '2 Đinh Tiên Hoàng, Quận 1, TP.HCM', lat: 10.7876, lng: 106.7001, sports: ['pickleball'], amenities: ['parking', 'water', 'locker'], min: 120000, max: 250000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000010' },
    { id: 'b0000000-0000-0000-0000-000000000006', name: 'Sân Tennis Rạch Miễu', address: '1 Hoa Phượng, Phú Nhuận, TP.HCM', lat: 10.7994, lng: 106.6806, sports: ['tennis'], amenities: ['wifi', 'parking', 'shower', 'canteen'], min: 200000, max: 500000, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000011' },
    { id: 'b0000000-0000-0000-0000-000000000007', name: 'Sân Cầu Lông Đại Học Y Dược', address: 'Ngô Quyền, Quận 5, TP.HCM', lat: 10.7555, lng: 106.6611, sports: ['badminton'], amenities: ['parking', 'water'], min: 45000, max: 80000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000011' },
    { id: 'b0000000-0000-0000-0000-000000000008', name: 'Sân Bóng Đá Chảo Lửa', address: '30 Phan Thúc Duyện, Tân Bình, TP.HCM', lat: 10.8037, lng: 106.6622, sports: ['football'], amenities: ['parking', 'water', 'shower'], min: 250000, max: 600000, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000012' },
    { id: 'b0000000-0000-0000-0000-000000000009', name: 'Sân Pickleball Thảo Điền', address: '12 Quốc Hương, Thảo Điền, Quận 2, TP.HCM', lat: 10.8041, lng: 106.7394, sports: ['pickleball'], amenities: ['wifi', 'parking', 'canteen'], min: 140000, max: 280000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000012' },
    { id: 'b0000000-0000-0000-0000-000000000010', name: 'Sân Tennis Khang An', address: '18A Phan Văn Trị, Gò Vấp, TP.HCM', lat: 10.8268, lng: 106.6788, sports: ['tennis'], amenities: ['parking', 'canteen', 'shower'], min: 180000, max: 400000, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000013' },
    { id: 'b0000000-0000-0000-0000-000000000011', name: 'Sân Cầu Lông Kỳ Hòa', address: 'Sư Vạn Hạnh, Quận 10, TP.HCM', lat: 10.7712, lng: 106.6672, sports: ['badminton'], amenities: ['wifi', 'parking', 'canteen'], min: 55000, max: 100000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000013' },
    { id: 'b0000000-0000-0000-0000-000000000012', name: 'Sân Pickleball Sala', address: 'Mai Chí Thọ, Quận 2, TP.HCM', lat: 10.7731, lng: 106.7214, sports: ['pickleball'], amenities: ['wifi', 'parking', 'shower', 'vip_lounge'], min: 160000, max: 350000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000014' },
    { id: 'b0000000-0000-0000-0000-000000000013', name: 'Sân Bóng Rổ Phú Thọ', address: 'Lý Thường Kiệt, Quận 11, TP.HCM', lat: 10.7695, lng: 106.6575, sports: ['basketball'], amenities: ['parking', 'water', 'locker'], min: 80000, max: 200000, img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', owner_id: 'a0000000-0000-0000-0000-000000000014' },
  ];

  const venues = [];
  for (const v of venuesData) {
    const created = await prisma.venue.create({
      data: {
        id: v.id,
        name: v.name,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        sport_types: v.sports,
        amenities: v.amenities,
        min_price: v.min,
        max_price: v.max,
        cover_image_url: v.img,
        owner_id: v.owner_id
      }
    });
    venues.push(created);
  }

  console.log('🎾 3. Đang tạo các Sân nhỏ (3 Sân lẻ cho MỖI Cụm sân, tổng cộng 39 Sân nhỏ)...');
  const courts = [];
  let courtIndex = 1;
  for (const venue of venues) {
    const sportType = venue.sport_types[0] || 'badminton';
    for (let c = 1; c <= 3; c++) {
      const courtId = `c0000000-0000-0000-0000-${String(courtIndex).padStart(12, '0')}`;
      const created = await prisma.court.create({
        data: {
          id: courtId,
          venue_id: venue.id,
          name: `Sân lẻ ${c} (${sportType.toUpperCase()})`,
          sport_type: sportType,
          image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=200&q=80'
        }
      });
      courts.push(created);
      courtIndex++;
    }
  }

  console.log('⏰ 4. Đang thiết lập ngày thử nghiệm (Hôm nay, Ngày mai, Ngày kia)...');
  const today = new Date();
  const dateStr0 = today.toISOString().split('T')[0];
  
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const dateStr1 = tomorrow.toISOString().split('T')[0];

  const nextDay = new Date();
  nextDay.setDate(today.getDate() + 2);
  const dateStr2 = nextDay.toISOString().split('T')[0];
  
  const dates = [dateStr0, dateStr1, dateStr2];

  console.log('💰 5. Đang tự động tạo 39 Hóa đơn đặt sân thành công (Bookings) - Đảm bảo MỖI Cụm sân đều có 3 Hóa đơn...');
  
  const bookings = [];
  const paymentMethods = ['credit-card', 'momo', 'sepay', 'qr'];
  let bookingCount = 1;

  // Với 13 cụm sân, mỗi cụm tạo đúng 3 Bookings
  const bookingMap = new Map(); // venue_id -> Booking[]

  for (const venue of venues) {
    const venueBookings = [];
    for (let b = 1; b <= 3; b++) {
      const randomUser = users[b - 1]; // user_1, user_2, user_3 lần lượt đặt
      const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const randomDaysAgo = Math.floor(Math.random() * 7);
      const bookingDate = new Date();
      bookingDate.setDate(today.getDate() - randomDaysAgo);
      bookingDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

      const amount = venue.min_price * 1 + Math.floor(Math.random() * 2) * (venue.max_price - venue.min_price);
      const booking = await prisma.booking.create({
        data: {
          id: `d0000000-0000-0000-0000-${String(bookingCount).padStart(12, '0')}`,
          user_id: randomUser.id,
          venue_id: venue.id,
          status: 'completed',
          payment_method: randomPayment,
          total_amount: amount,
          final_amount: amount,
          created_at: bookingDate
        }
      });
      bookings.push(booking);
      venueBookings.push(booking);
      bookingCount++;
    }
    bookingMap.set(venue.id, venueBookings);
  }

  console.log('📅 6. Đang tự động nạp LỊCH TRÌNH KHỦNG (1,872 Slots) và gán 39 Bookings khớp từng sân nhỏ...');
  
  const slotsDataList = [];
  let slotIndex = 1;

  for (const court of courts) {
    const venue = venues.find(v => v.id === court.venue_id)!;
    const minPrice = venue.min_price;
    const maxPrice = venue.max_price;
    
    // Lấy danh sách Bookings của cụm sân này
    const venueBookings = bookingMap.get(venue.id) || [];
    
    for (const d of dates) {
      for (let hour = 6; hour <= 21; hour++) {
        const startStr = `${String(hour).padStart(2, '0')}:00`;
        const endStr = `${String(hour + 1).padStart(2, '0')}:00`;
        const basePrice = hour >= 17 ? maxPrice : minPrice;
        
        let status = 'available';
        let bookingId = null;
        let version = 1;

        // Gán Bookings ngẫu nhiên vào sân lẻ 1 của cụm sân vào ngày hôm nay
        const isCourt1 = court.id === courts.find(c => c.venue_id === venue.id)!.id;
        const bookingToAssign = (d === dateStr0 && isCourt1 && hour === 8) ? venueBookings[0] :
                                (d === dateStr0 && isCourt1 && hour === 12) ? venueBookings[1] :
                                (d === dateStr0 && isCourt1 && hour === 16) ? venueBookings[2] : null;

        if (bookingToAssign) {
          status = 'booked';
          bookingId = bookingToAssign.id;
          version = 2;
          
          slotsDataList.push({
            id: `e0000000-0000-0000-0000-${String(slotIndex++).padStart(12, '0')}`,
            court_id: court.id,
            date: d,
            start_time: startStr,
            end_time: endStr,
            status,
            price: bookingToAssign.total_amount,
            booking_id: bookingId,
            version
          });
        } else {
          // 85% available, 10% booked ngẫu nhiên khác, 5% locked
          const rand = Math.random();
          if (rand > 0.90) {
            status = 'booked';
            version = 2;
          } else if (rand > 0.85) {
            status = 'locked';
            version = 2;
          }
          
          slotsDataList.push({
            id: `e0000000-0000-0000-0000-${String(slotIndex++).padStart(12, '0')}`,
            court_id: court.id,
            date: d,
            start_time: startStr,
            end_time: endStr,
            status,
            price: basePrice,
            booking_id: null,
            version
          });
        }
      }
    }
  }

  // Nạp Slots theo từng chunk
  const chunkSize = 500;
  for (let i = 0; i < slotsDataList.length; i += chunkSize) {
    const chunk = slotsDataList.slice(i, i + chunkSize);
    await prisma.slot.createMany({
      data: chunk
    });
  }
  console.log(`Đã nạp thành công ${slotsDataList.length} slots thực tế cực khủng!`);

  console.log('⭐️ 7. Đang tạo 39 Nhận xét (Reviews) động cực kỳ cá nhân hóa - Đảm bảo MỖI Cụm sân có đúng 3 Đánh giá thực tế...');
  
  const reviewsDataList = [];
  let reviewIdx = 1;

  for (const venue of venues) {
    const venueBookings = bookingMap.get(venue.id) || [];
    
    const commentTemplates = [
      `Trải nghiệm chơi thể thao tại ${venue.name} cực kỳ tuyệt vời! Sân rất mới, mặt sân chất lượng cao và bám chân rất tốt. Sẽ quay lại nhiều lần!`,
      `Dịch vụ ở ${venue.name} vô cùng chu đáo. Bãi đỗ xe hơi rộng rãi, canteen phục vụ nước lạnh siêu nhanh và chủ sân thân thiện 5 sao.`,
      `Tôi thường xuyên đặt lịch tại ${venue.name}. Giá thuê vô cùng hợp lý so với chất lượng, phòng thay đồ thoáng mát, sạch sẽ.`
    ];

    for (let r = 0; r < 3; r++) {
      const booking = venueBookings[r];
      const randomRating = 4 + Math.floor(Math.random() * 2); // 4 hoặc 5 sao
      const comment = commentTemplates[r];
      
      const reviewDate = new Date(booking.created_at.getTime() + 2 * 60 * 60 * 1000); // 2 giờ sau khi đặt

      reviewsDataList.push({
        id: `f0000000-0000-0000-0000-${String(reviewIdx).padStart(12, '0')}`,
        booking_id: booking.id,
        user_id: booking.user_id,
        venue_id: venue.id,
        rating: randomRating,
        comment: comment,
        created_at: reviewDate
      });
      reviewIdx++;
    }
  }

  await prisma.review.createMany({
    data: reviewsDataList
  });
  console.log(`Đã nạp thành công 39 đánh giá khách hàng sinh động.`);

  console.log('🧾 8. Đang nạp 39 Hóa đơn MISA đồng bộ trạng thái synced cho Admin Invoices...');
  
  const invoicesDataList = [];
  for (let i = 0; i < bookings.length; i++) {
    const booking = bookings[i];
    invoicesDataList.push({
      id: `ff000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      booking_id: booking.id,
      misa_invoice_no: `MISA-${booking.id.substring(19).toUpperCase()}`,
      pdf_url: `/invoices/misa_${booking.id.substring(19)}.pdf`,
      status: 'synced',
      issued_at: booking.created_at
    });
  }

  await prisma.invoice.createMany({
    data: invoicesDataList
  });
  console.log(`Đã nạp thành công 39 hóa đơn MISA đồng bộ lên hệ thống.`);

  console.log('🔄 9. Đang đồng bộ Ratings thực tế vào bảng Venue...');
  for (const venue of venues) {
    const venueReviews = reviewsDataList.filter(r => r.venue_id === venue.id);
    const total = venueReviews.length;
    const average = Number((venueReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1));
    
    await prisma.venue.update({
      where: { id: venue.id },
      data: {
        total_reviews: total,
        rating_avg: average
      }
    });
  }

  console.log('\n🌟 DỮ LIỆU SIÊU KHỦNG & ĐẦY ĐỦ ĐÃ ĐƯỢC THIẾT LẬP THÀNH CÔNG!');
  console.log('========================================================');
  console.log('👉 Danh sách 6 tài khoản Chủ sân (Mật khẩu: password123):');
  for (const o of ownersData) {
    console.log(`   - ${o.name}: ${o.email}`);
  }
  console.log('========================================================');
  console.log('👉 Tài khoản Khách hàng để Đặt Sân & Đánh Giá:');
  console.log('   - Email: khoa@courtmate.vn');
  console.log('   - Mật khẩu: password123');
  console.log('========================================================\n');
}

main()
  .catch((e) => {
    console.error('Lỗi khi nạp dữ liệu demo:', e);
    process.exit(1);
  });