import dotenv from 'dotenv';
import path from 'path';

// Ép dotenv tìm chính xác file .env ở thư mục gốc của project
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error("❌ Vẫn chưa đọc được DATABASE_URL. Hãy kiểm tra lại file .env của bạn!");
}

export default {
  // Thêm phần cấu hình seed này vào
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};