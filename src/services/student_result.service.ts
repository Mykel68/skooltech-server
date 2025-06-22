import {
  Attendance,
  Class,
  ClassStudent,
  GradingSetting,
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
    const session = enrollment.Session!;
    const classData = enrollment.Class!;
    const term = enrollment.Term!;

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
        {
          model: GradingSetting,
          as: "grading_setting",
        },
      ],
    });

    if (!scores.length) continue;

    const subjectsGrouped: { [subject_id: string]: any[] } = {};
    for (const score of scores) {
      if (!subjectsGrouped[score.subject_id])
        subjectsGrouped[score.subject_id] = [];
      subjectsGrouped[score.subject_id].push(score);
    }

    const summaryScores = Object.entries(subjectsGrouped).map(
      ([subject_id, entries]) => {
        const total_score = entries.reduce((sum, s) => sum + s.total_score, 0);
        const total_score_possible = entries.reduce(
          (sum, s) => sum + s.grading_setting.mark,
          0
        );
        const subject_name = entries[0].subject.name;
        const components = entries.map((s) => ({
          component_name: s.grading_setting.component_name,
          mark: s.grading_setting.mark,
          score: s.total_score,
        }));

        let extra: any = {};
        if (
          classEnrollments.filter(
            (e) => e?.Session?.session_id! === session.session_id
          ).length === 1
        ) {
          extra = {
            average: 0, // Placeholder: Calculate class average here
            min: 0,
            max: 0,
          };
        }

        return {
          subject_id,
          subject_name,
          total_score,
          total_score_possible,
          components,
          ...extra,
        };
      }
    );

    const entry = sessionsMap[session?.session_id!] || {
      session: {
        session_id: session.session_id,
        name: session.name,
      },
      terms: [],
    };

    entry.terms.push({
      term_id: term.term_id,
      name: term.name,
      start_date: term.start_date,
      end_date: term.end_date,
      class: {
        class_id: classData.class_id,
        name: classData.name,
        grade_level: classData.grade_level,
      },
      scores: summaryScores,
    });

    sessionsMap[session?.session_id!] = entry;
  }

  for (const session of Object.values(sessionsMap)) {
    session.terms.sort(
      (a: any, b: any) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const terms = session.terms;

    terms.forEach((term: any, idx: number) => {
      if (terms.length >= 3 && idx < terms.length - 1) {
        term.scores = term.scores.map((s: any) => ({
          subject_id: s.subject_id,
          subject_name: s.subject_name,
          total_score: s.total_score,
          total_score_possible: s.total_score_possible,
        }));
      } else if (terms.length === 2 && idx === 0) {
        term.scores = term.scores.map((s: any) => ({
          subject_id: s.subject_id,
          subject_name: s.subject_name,
          total_score: s.total_score,
          total_score_possible: s.total_score_possible,
        }));
      }
    });
  }

  const attendance = await Attendance.findAll({
    where: { student_id },
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
