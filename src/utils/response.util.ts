import { Response } from 'express';
export const sendResponse = (res: Response, statusCode: number, data: any) => {
  res.status(statusCode).json({ success: true, data });
};