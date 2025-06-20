import { Session, StudentScore, Subject, Term, User } from "../models";

export const getStudentResult = async (
  student_id: string,
  school_id: string
) => {
  const sessions = await Session.findAll({ where: { school_id } });

  const resultsBySession = [];

  for (const session of sessions) {
    const terms = await Term.findAll({
      where: { session_id: session.session_id },
      order: [["start_date", "ASC"]],
    });

    const sessionResult: any = {
      session_id: session.session_id,
      session_name: session.name,
      terms: [],
    };

    let scoredTerms = 0;

    for (const term of terms) {
      const scores = await StudentScore.findAll({
        where: {
          user_id: student_id,
        },
        include: [
          { model: Subject, as: "subject", attributes: ["name"] },
          {
            model: User,
            as: "teacher",
            attributes: ["first_name", "last_name"],
          },
        ],
      });

      if (!scores.length) continue;
      scoredTerms++;

      const termData = {
        term_id: term.term_id,
        term_name: term.name,
        start_date: term.start_date,
        results: [] as any[],
      };

      for (const score of scores) {
        const subjectScores = await StudentScore.findAll({
          where: {
            subject_id: score.subject_id,
            class_id: score.class_id,
          },
        });

        const totalScores = subjectScores.map((s) => s.total_score);

        const subjectResult = {
          subject: score.subject?.name,
          total_score: score.total_score,
          ...(scoredTerms < 3 && scoredTerms === terms.length
            ? {}
            : {
                components: score.scores,
              }),
          class_average:
            totalScores.reduce((sum, val) => sum + val, 0) / totalScores.length,
          lowest_score: Math.min(...totalScores),
          highest_score: Math.max(...totalScores),
        };

        termData.results.push(subjectResult);
      }

      sessionResult.terms.push(termData);
    }

    if (sessionResult.terms.length > 0) {
      resultsBySession.push(sessionResult);
    }
  }

  return { sessions: resultsBySession };
};
