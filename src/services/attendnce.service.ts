import Attendance from "../models/attendance.model";
import AttendanceLog from "../models/attendanceLog";
import Class from "../models/class.model";
import ClassStudent from "../models/class_student.model";
import ClassTeacher from "../models/class_teacher.model";
import Term from "../models/term.model";
import User from "../models/user.model";
import { calculateSchoolDays } from "../utils/date.util";
import { AppError } from "../utils/error.util";
import { countWeekdays } from "../utils/getWeekdays";

interface DailyAttendancePayload {
  student_id: string;
  class_id: string;
  session_id: string;
  term_id: string;
  school_id: string;
  date: Date;
  present: boolean;
}

export const recordAttendance = async (
  school_id: string,
  student_id: string,
  class_id: string,
  term_id: string,
  session_id: string,
  days_present: number
) => {
  // Check if term exists and fetch its duration
  const term = await Term.findOne({
    where: { term_id, session_id, school_id },
  });
  if (!term || !term.start_date || !term.end_date)
    throw new AppError("Term not properly set up", 404);

  // Upsert attendance record
  const [record, created] = await Attendance.upsert(
    {
      school_id,
      student_id,
      class_id,
      term_id,
      session_id,
      days_present,
    },
    { returning: true }
  );

  return {
    ...record.toJSON(),
    total_days: countWeekdays(
      new Date(term.start_date),
      new Date(term.end_date)
    ),
  };
};

export const getAttendance = async (
  school_id: string,
  student_id: string,
  term_id: string,
  session_id: string
) => {
  const record = await Attendance.findOne({
    where: { school_id, student_id, term_id, session_id },
  });
  const term = await Term.findOne({
    where: { term_id, session_id, school_id },
  });

  if (!term || !term.start_date || !term.end_date)
    throw new AppError("Term not properly set up", 404);

  const total_days = countWeekdays(
    new Date(term.start_date),
    new Date(term.end_date)
  );
  return {
    days_present: record?.days_present ?? 0,
    total_days,
  };
};

export const markStudentDailyAttendance = async ({
  student_id,
  class_id,
  session_id,
  term_id,
  school_id,
  date,
  present,
}: DailyAttendancePayload) => {
  // Check if already marked
  const exists = await AttendanceLog.findOne({
    where: {
      student_id,
      class_id,
      session_id,
      term_id,
      school_id,
      date,
    },
  });

  if (exists) {
    throw new AppError("Attendance already marked for this date", 400);
  }

  // Record daily log
  await AttendanceLog.create({
    student_id,
    class_id,
    session_id,
    term_id,
    school_id,
    date,
    present,
  });

  // Update or create main Attendance record if present
  if (present) {
    const [attendance] = await Attendance.findOrCreate({
      where: {
        student_id,
        class_id,
        session_id,
        term_id,
        school_id,
      },
    });

    if (!attendance.isNewRecord) {
      attendance.days_present += 1;
      await attendance.save();
    }
  }

  return {
    student_id,
    class_id,
    session_id,
    term_id,
    school_id,
    date,
    present,
  };
};

export const recordBulkAttendance = async ({
  school_id,
  class_id,
  session_id,
  term_id,
  attendances,
}: {
  school_id: string;
  class_id: string;
  session_id: string;
  term_id: string;
  attendances: { student_id: string; days_present: number }[];
}) => {
  const created = await Attendance.bulkCreate(
    attendances.map((a) => ({
      school_id,
      class_id,
      session_id,
      term_id,
      ...a,
    })),
    { updateOnDuplicate: ["days_present"] }
  );
  return created;
};

export const getClassAttendance = async (
  school_id: string,
  class_id: string,
  session_id: string,
  term_id: string,
  total_school_days: number
) => {
  const records = await Attendance.findAll({
    where: { school_id, class_id, session_id, term_id },
    include: [
      {
        model: User,
        as: "student",
        attributes: ["first_name", "last_name", "user_id"],
      },
    ],
  });

  return records.map((r) => ({
    student: r.student_id,
    days_present: r.days_present,
    total_days: total_school_days,
  }));
};

export const getTeacherClassStudentsAttendanceReport = async (
  school_id: string,
  session_id: string,
  term_id: string,
  teacher_id: string
) => {
  const classDetails = await ClassTeacher.findOne({
    where: { school_id, teacher_id, session_id, term_id },
    attributes: ["class_id", "session_id", "term_id"],
    include: [
      {
        model: Class,
        as: "class",
        attributes: ["name", "class_id"],
      },
    ],
  });

  if (!classDetails) {
    return "Teacher is not assigned to any class in this session and term";
  }

  // Get the term for start and end date
  const term = await Term.findOne({
    where: { term_id },
    attributes: ["start_date", "end_date"],
  });

  if (!term || !term.start_date || !term.end_date) {
    throw new AppError("Invalid term or term dates not set", 400);
  }

  const total_school_days = calculateSchoolDays(term.start_date, term.end_date);

  const students = await User.findAll({
    where: {
      school_id,
      role: "Student",
    },
    include: [
      {
        model: ClassStudent,
        as: "class_students",
        where: {
          class_id: classDetails.class_id,
          session_id: classDetails.session_id,
          term_id: classDetails.term_id,
        },
        attributes: [],
      },
      {
        model: Attendance,
        as: "attendances",
        where: {
          class_id: classDetails.class_id,
          session_id,
          term_id,
        },
        required: false,
        attributes: ["days_present"],
      },
    ],
    attributes: ["user_id", "first_name", "last_name", "email"],
  });

  return {
    classDetails,
    total_school_days,
    students: students.map((s) => ({
      user_id: s.user_id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      present_days: s.attendances?.[0]?.days_present ?? 0,
    })),
  };
};

export const getAttendanceSummary = async (
  school_id: string,
  class_id: string,
  session_id: string,
  term_id: string
) => {
  // Get term to calculate total school days
  const term = await Term.findOne({
    where: { term_id, school_id },
    attributes: ["start_date", "end_date"],
  });

  if (!term) throw new AppError("Term not found", 404);

  const totalDays = calculateSchoolDays(term.start_date, term.end_date);

  // Get attendance records
  const records = await Attendance.findAll({
    where: { school_id, class_id, session_id, term_id },
    include: [
      {
        model: User,
        as: "student",
        attributes: ["user_id", "first_name", "last_name"],
      },
      {
        model: Class,
        attributes: ["name", "grade_level"],
      },
    ],
  });

  const attendanceData = records.map((record) => {
    const presentDays = record.days_present;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = +((presentDays / totalDays) * 100).toFixed(1);

    return {
      attendance_id: record.attendance_id,
      studentId: record.student?.user_id,
      studentName: `${record.student?.first_name} ${record.student?.last_name}`,
      classId: record.class_id,
      className: record.Class?.name,
      grade_level: record.Class?.grade_level,
      presentDays,
      absentDays,
      attendancePercentage,
    };
  });

  return {
    totalDays,
    attendanceData,
  };
};
