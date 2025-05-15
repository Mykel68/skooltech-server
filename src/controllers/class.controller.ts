import { Request, Response } from "express";
import * as classService from "../services/class.service";
import { sendResponse } from "../utils/response.util";
import { AppError } from "../utils/error.util";

/**
 * Handle class creation request
 */
export const createClassHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { school_id } = req.params;
  const { name, grade_level, short } = req.body;
  console.log("Class instance", school_id, name, grade_level, short);
  console.log("Body", req.body);
  try {
    if (!school_id || !name) {
      throw new AppError("School ID and name are required", 400);
    }

    const classInstance = await classService.createClass(
      school_id,
      name,
      grade_level,
      short
    );

    sendResponse(res, 201, {
      class_id: classInstance.class_id,
      school_id: classInstance.school_id,
      name: classInstance.name,
      grade_level: classInstance.grade_level,
    });
  } catch (error: any) {
    console.log("Error", error);
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Handle fetching a class by ID
 */
export const getClassHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { class_id } = req.params;
  const school_id = (req as any).user?.school_id;

  try {
    if (!class_id) {
      throw new AppError("Class ID is required", 400);
    }

    const classInstance = await classService.getClassById(class_id, school_id);

    sendResponse(res, 200, {
      class_id: classInstance.class_id,
      school_id: classInstance.school_id,
      name: classInstance.name,
      grade_level: classInstance.grade_level,
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Handle fetching all classes of a school
 */
export const getAllClassesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { school_id } = req.params;

  try {
    if (!school_id) {
      throw new AppError("School ID is required", 400);
    }

    const classes = await classService.getAllClassesOfSchool(school_id);

    sendResponse(res, 200, {
      classes: classes.map((c) => ({
        class_id: c.class_id,
        school_id: c.school_id,
        name: c.name,
        grade_level: c.grade_level,
      })),
    });
  } catch (error: any) {
    sendResponse(res, error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
};
