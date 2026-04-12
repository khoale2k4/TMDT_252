import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]:', err);

  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
      details: err.details || {}
    }
  });
};