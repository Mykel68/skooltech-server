import { Model, Optional } from "sequelize";
import { StudentScoreInstance } from "../models/student_score.model";
import { AttendanceInstance } from "../models/attendance.model";
import { ClassTeacherInstance } from "../models/class_teacher.model";

export interface SchoolRegistrationData {
  name: string;
  address?: string;
  school_image?: string;
  phone_number?: string;
  school_code?: string;
  admin_username: string;
  admin_password: string;
  admin_email: string;
  admin_first_name?: string;
  admin_last_name?: string;
}

export interface StudentTeacherRegistrationData {
  username: string;
  password: string;
  email: string;
  role: "Student" | "Teacher";
  first_name?: string;
  last_name?: string;
  school_id: string;
  class_id?: string;
  session_id?: string;
  term_id?: string;
  gender?: "Male" | "Female";
}

export interface UserRegistrationData {
  username: string;
  password: string;
  email: string;
  role: "Student" | "Teacher";
  first_name?: string;
  last_name?: string;
  school_id: string;
  gender?: "Male" | "Female";
}

export interface UserCreationData {
  username: string;
  password: string;
  email: string;
  role: "Admin" | "Teacher" | "Student" | "Parent";
  school_id: string;
  first_name?: string;
  last_name?: string;
  gender?: "Male" | "Female";
}

export interface UserAttributes {
  user_id?: string;
  school_id: string;
  role: "Admin" | "Teacher" | "Student" | "Parent";
  username: string;
  password_hash: string;
  email: string;
  first_name?: string;
  last_name?: string;
  gender?: "Male" | "Female";
  is_approved?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface SchoolAttributes {
  school_id?: string;
  name: string;
  address?: string;
  school_image?: string | null;
  phone_number?: string | null;
  school_code?: string | null;
  is_active?: boolean; // providing school code will activate  the school
  motto?: string;
}

export interface SchoolInstance
  extends Model<SchoolAttributes>,
    SchoolAttributes {}

export interface SubjectAttributes {
  subject_id?: string;
  school_id: string;
  class_id: string;
  teacher_id: string;
  term_id: string;
  session_id: string;
  is_approved?: boolean;
  name: string;
  short?: string;
}

export interface AssessmentAttributes {
  assessment_id?: string;
  term_id: string;
  class_id: string;
  subject_id: string;
  type: "Exam" | "Quiz" | "Assignment";
  date: Date;
  max_score: number;
  name: string;
}

export interface AssessmentInstance
  extends Model<AssessmentAttributes>,
    AssessmentAttributes {}

export interface ScoreAttributes {
  score_id?: string;
  student_id: string;
  assessment_id: string;
  score: number;
}

export interface ScoreInstance
  extends Model<ScoreAttributes>,
    ScoreAttributes {}

export interface GradingConfigAttributes {
  config_id?: string;
  school_id: string;
  assessment_type: string;
  weight: number;
}

export interface GradingConfigInstance
  extends Model<GradingConfigAttributes>,
    GradingConfigAttributes {}

export interface GradeScaleAttributes {
  scale_id?: string;
  school_id: string;
  letter_grade: string;
  min_score: number;
  max_score: number;
}

export interface GradeScaleInstance
  extends Model<GradeScaleAttributes>,
    GradeScaleAttributes {}

interface SessionAttributes {
  session_id: string;
  school_id: string;
  name: string;
  is_active: boolean;
  start_date: Date;
  end_date: Date;
}

interface SessionCreationAttributes
  extends Optional<
    SessionAttributes,
    "session_id" | "created_at" | "updated_at"
  > {}
export interface SessionInstance
  extends Model<SessionAttributes, SessionCreationAttributes>,
    SessionAttributes {
  terms?: TermInstance[];
}

interface TermAttributes {
  term_id: string;
  school_id: string;
  session_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
}

interface TermCreationAttributes
  extends Optional<TermAttributes, "term_id" | "created_at" | "updated_at"> {}
export interface TermInstance
  extends Model<TermAttributes, TermCreationAttributes>,
    TermAttributes {}
