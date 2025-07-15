import { Request, Response, NextFunction } from "express";
import * as MessageService from "../services/message.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin_id = req.user?.user_id;
    const school_id = req.params.school_id;

    const message = await MessageService.createMessage({
      ...req.body,
      admin_id,
      school_id,
    });

    sendResponse(res, 201, {
      message: "Message sent successfully",
      data: message,
    });
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

export const getUserMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.user_id;
    const messages = await MessageService.getMessagesForUser(user_id!);
    sendResponse(res, 200, messages);
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

export const getSchoolMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin_id = req.user?.user_id;
    const school_id = req.params.school_id;
    const messages = await MessageService.getSchoolMessages(
      school_id,
      admin_id!
    );
    sendResponse(res, 200, { messages });
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

export const getMessageById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.user_id;
    const message = await MessageService.getMessageById(
      req.params.id,
      user_id!
    );
    sendResponse(res, 200, message);
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

export const markMessageAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.user_id;
    const result = await MessageService.markMessageAsRead(
      req.params.id,
      user_id!
    );
    sendResponse(res, 200, {
      message: "Message marked as read",
      data: result,
    });
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

export const deleteMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.user_id;
    const result = await MessageService.deleteMessage(req.params.id, user_id!);
    sendResponse(res, 200, {
      message: "Message deleted successfully",
      data: result,
    });
  } catch (err: any) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
