import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv'; 


dotenv.config(); 

// Lấy chuỗi kết nối từ biến môi trường
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Vui lòng khai báo DATABASE_URL trong file .env");
}

// Khởi tạo connection pool thông qua thư viện pg
const pool = new Pool({ connectionString });

// Truyền pool vào adapter của Prisma
const adapter = new PrismaPg(pool);

// Khởi tạo Prisma Client với adapter
const prisma = new PrismaClient({ adapter });

export default prisma;