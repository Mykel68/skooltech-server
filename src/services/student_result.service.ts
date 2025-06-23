import { Op } from "sequelize";
import Term from "../models/term.model";
import Session from "../models/session.model";
import StudentScore from "../models/student_score.model";
import Subject from "../models/subject.model";
import Attendance from "../models/attendance.model";
import User from "../models/user.model";
import School from "../models/school.model";
import ClassStudent from "../models/class_student.model";
import Class from "../models/class.model";
import GradingSetting from "../models/grading_setting.model";

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
          where: {
            is_approved: true,
            session_id: session.session_id,
            term_id: term.term_id,
          },
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
        const subject_name = entries[0].subject.name;
        const gradingSetting = entries[0].grading_setting;

        const components =
          gradingSetting?.components?.map((comp: any) => {
            const scoreEntry = entries.find(
              (e) => e.component_name === comp.name
            );
            return {
              component_name: comp.name,
              weight: comp.weight,
              score: scoreEntry ? scoreEntry.total_score : 0,
            };
          }) || [];

        const total_score_possible = 100; // Usually it's 100 when weight sums to 100%

        let extra: any = {};
        if (
          classEnrollments.filter(
            (e) => e?.Session?.session_id === session.session_id
          ).length === 1
        ) {
          extra = {
            average: 0,
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

    const entry = sessionsMap[session.session_id!] || {
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

    sessionsMap[session.session_id!] = entry;
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
