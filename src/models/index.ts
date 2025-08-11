import sequelize from "../config/db";

// Import ALL models first
import Class from "./class.model";
import School from "./school.model";
import User from "./user.model";
import Subject from "./subject.model";
import Attendance from "./attendance.model";
import ClassStudent from "./class_student.model";
import ClassTeacher from "./class_teacher.model";
import Session from "./session.model";
import Term from "./term.model";
import GradingSetting from "./grading_setting.model";
import StudentScore from "./student_score.model";
import ParentLink from "./parentLink";
import SchoolSequence from "./school_sequence.model";
import ParentStudent from "./parent_student.model";
import StudentLinkCode from "./student_link_code";
import Message from "./message";
import MessageRecipient from "./message_recipient";
import Role from "./role.model";

// Apply all relationships
import { applyAssociations } from "./associations";
applyAssociations();

// Export them for external use
export {
  sequelize,
  Class,
  School,
  User,
  Subject,
  Attendance,
  ClassStudent,
  ClassTeacher,
  Session,
  Term,
  GradingSetting,
  StudentScore,
  StudentLinkCode,
  ParentLink,
  SchoolSequence,
  ParentStudent,
  Message,
  MessageRecipient,
  Role,
};
