import {
  Attendance,
  Class,
  ClassStudent,
  School,
  Session,
  StudentScore,
  Subject,
  Term,
  User,
} from "../models";

export const getStudentResults = async (
  student_id: string,
  school_id: string
) => {
  const classEnrollments = await ClassStudent.findAll({
    where: { student_id },
    include: [Class, Session, Term],
  });

  const sessionsMap: { [session_id: string]: any } = {};

  for (const enrollment of classEnrollments) {
    const session = enrollment.Session;
    const classData = enrollment.Class;
    const term = enrollment.Term;

    const scores = await StudentScore.findAll({
      where: {
        user_id: student_id,
      },
      include: [
        {
          model: Subject,
          as: "subject",
          where: { is_approved: true },
        },
      ],
    });

    if (!scores.length) continue;

    const summaryScores = scores.map((score) => ({
      subject_id: score.subject_id,
      subject_name: score.subject.name,
      total_score: score.total_score,
    }));

    const entry = sessionsMap[session?.session_id!] || {
      session: {
        session_id: session?.session_id!,
        name: session?.name!,
      },
      terms: [],
    };

    entry.terms.push({
      term_id: term?.term_id!,
      name: term?.name!,
      start_date: term?.start_date!,
      end_date: term?.end_date!,
      class: {
        class_id: classData?.class_id!,
        name: classData?.name!,
        grade_level: classData?.grade_level!,
      },
      scores: summaryScores,
    });

    sessionsMap[session?.session_id!] = entry;
  }

  const attendance = await Attendance.findAll({
    where: { student_id: student_id },
  });

  const student = await User.findByPk(student_id, {
    attributes: ["user_id", "first_name", "last_name", "email"],
  });

  const school = await School.findByPk(school_id, {
    attributes: ["name", "address"],
  });

  return {
    student,
    school,
    attendance,
    sessions: Object.values(sessionsMap),
  };
};
