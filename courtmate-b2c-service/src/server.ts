console.log("=== BẮT ĐẦU CHẠY SERVER.TS ===");
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 B2C Backend Service running on http://localhost:${PORT}`);
});
