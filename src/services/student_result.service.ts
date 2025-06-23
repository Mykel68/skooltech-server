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
import { Op } from "sequelize";

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

    const summaryScores = await Promise.all(
      Object.entries(subjectsGrouped).map(async ([subject_id, entries]) => {
        const total_score = entries.reduce((sum, s) => sum + s.total_score, 0);
        const subject_name = entries[0].subject.name;
        const gradingSetting = entries[0].grading_setting;

        const components =
          gradingSetting?.components?.map((comp: any) => {
            const entry = entries.find((e) =>
              e.scores.some((sc: any) => sc.component_name === comp.name)
            );
            const scoreComp = entry?.scores.find(
              (sc: any) => sc.component_name === comp.name
            );
            return {
              component_name: comp.name,
              weight: comp.weight,
              score: scoreComp ? scoreComp.score : 0,
            };
          }) || [];

        const total_score_possible = 100;

        const classScores = await StudentScore.findAll({
          where: {
            subject_id,
            class_id: classData.class_id,
          },
        });

        const allScores = classScores.map((s) => s.total_score);
        const average = allScores.reduce((a, b) => a + b, 0) / allScores.length;
        const min = Math.min(...allScores);
        const max = Math.max(...allScores);

        const sortedScores = [...allScores].sort((a, b) => b - a);
        const subject_position = sortedScores.indexOf(total_score) + 1;

        return {
          subject_id,
          subject_name,
          total_score,
          total_score_possible,
          components,
          average,
          min,
          max,
          subject_position,
        };
      })
    );

    const totalSubjects = summaryScores.length;
    const totalScores = summaryScores.reduce(
      (sum, s) => sum + s.total_score,
      0
    );

    const allStudentScores = await StudentScore.findAll({
      where: {
        class_id: classData.class_id,
      },
    });

    const totalStudents = await ClassStudent.count({
      where: {
        class_id: classData.class_id,
        session_id: session.session_id,
        term_id: term.term_id,
      },
    });

    const studentTotalsMap: { [user_id: string]: number } = {};
    allStudentScores.forEach((score) => {
      studentTotalsMap[score.user_id] =
        (studentTotalsMap[score.user_id] || 0) + score.total_score;
    });

    const sortedTotals = Object.entries(studentTotalsMap)
      .map(([user_id, total]) => ({ user_id, total }))
      .sort((a, b) => b.total - a.total);

    const overall_position =
      sortedTotals.findIndex((s) => s.user_id === student_id) + 1;

    const nextTerm = await Term.findOne({
      where: {
        session_id: session.session_id,
        start_date: { [Op.gt]: term.end_date },
      },
      order: [["start_date", "ASC"]],
    });

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
      next_term_start_date: nextTerm?.start_date || null,
      total_days: Math.ceil(
        (new Date(term.end_date).getTime() -
          new Date(term.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      scores: summaryScores,
      overall_position,
      totalStudents,
      total_score: totalScores,
    });

    sessionsMap[session.session_id!] = entry;
  }

  const attendance = await Attendance.findAll({
    where: { student_id },
  });

  const student = await User.findByPk(student_id, {
    attributes: ["user_id", "first_name", "last_name", "email", "gender"],
  });

  const school = await School.findByPk(school_id, {
    attributes: ["name", "address", "phone_number", "motto"],
    include: [
      {
        model: User,
        as: "users",
        attributes: ["email"],
        where: {
          school_id,
          role: "Admin",
        },
      },
    ],
  });

  return {
    student,
    school,
    attendance,
    sessions: Object.values(sessionsMap),
  };
};
