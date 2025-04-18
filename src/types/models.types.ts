import { Model } from "sequelize";

// User-related interfaces
export interface UserRegistrationData {
  username: string;
  password: string;
  email: string;
  role: "Student" | "Teacher";
  first_name?: string;
  last_name?: string;
}

export interface UserCreationData {
  username: string;
  password: string;
  email: string;
  role: "Admin" | "Teacher" | "Student" | "Parent";
  school_id: string;
  first_name?: string;
  last_name?: string;
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
  is_approved?: boolean;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {}

// School model
export interface SchoolAttributes {
  school_id?: string;
  name: string;
  address?: string;
}

export interface SchoolInstance
  extends Model<SchoolAttributes>,
    SchoolAttributes {}

// Subject model
export interface SubjectAttributes {
  subject_id?: string;
  school_id: string;
  name: string;
}

export interface SubjectInstance
  extends Model<SubjectAttributes>,
    SubjectAttributes {}

// Assessment model
export interface AssessmentAttributes {
  assessment_id?: string;
  class_id: string;
  subject_id: string;
  type: "Exam" | "Quiz" | "Assignment";
  date: Date;
  max_score: number;
}

export interface AssessmentInstance
  extends Model<AssessmentAttributes>,
    AssessmentAttributes {}

// Score model
export interface ScoreAttributes {
  score_id?: string;
  student_id: string;
  assessment_id: string;
  score: number;
}

export interface ScoreInstance
  extends Model<ScoreAttributes>,
    ScoreAttributes {}

// GradingConfig model
export interface GradingConfigAttributes {
  config_id?: string;
  school_id: string;
  assessment_type: string;
  weight: number;
}

export interface GradingConfigInstance
  extends Model<GradingConfigAttributes>,
    GradingConfigAttributes {}

// GradeScale model
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

// Class model
export interface ClassAttributes {
  class_id?: string;
  school_id: string;
  name: string;
  grade_level?: string;
}

export interface ClassInstance
  extends Model<ClassAttributes>,
    ClassAttributes {}
