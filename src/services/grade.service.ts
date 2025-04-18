import User from '../models/user.model';
import Assessment from '../models/assessment.model';
import Score from '../models/score.model';
import GradingConfig from '../models/gradingConfig.model';
import GradeScale from '../models/gradeScale.model';
import Subject from '../models/subject.model';
import { UserInstance, SubjectInstance, AssessmentInstance, ScoreInstance, GradingConfigInstance, GradeScaleInstance } from '../types/models.types';
import { AppError } from '../utils/error.util';

export const getStudentGrades = async (student_id: string) => {
  const student: UserInstance | null = await User.findByPk(student_id, { include: [{ model: User, as: 'School' }] });
  if (!student) throw new AppError('Student not found', 404);

  const subjects: SubjectInstance[] = await Subject.findAll({ where: { school_id: student.school_id } });
  const grades: { subject: string; score: number; letterGrade: string }[] = [];

  for (const subject of subjects) {
    const assessments: AssessmentInstance[] = await Assessment.findAll({ where: { subject_id: subject.subject_id } });
    let totalScore = 0;
    let totalWeight = 0;
    const gradingConfigs: GradingConfigInstance[] = await GradingConfig.findAll({ where: { school_id: student.school_id } });

    for (const assessment of assessments) {
      const score: ScoreInstance | null = await Score.findOne({ where: { student_id, assessment_id: assessment.assessment_id } });
      if (score) {
        const config = gradingConfigs.find(config => config.assessment_type === assessment.type);
        if (config) {
          const weightedScore = (score.score / assessment.max_score) * config.weight;
          totalScore += weightedScore;
          totalWeight += config.weight;
        }
      }
    }

    const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    const gradeScales: GradeScaleInstance[] = await GradeScale.findAll({ where: { school_id: student.school_id }, order: [['min_score', 'DESC']] });
    let letterGrade = 'N/A';
    for (const scale of gradeScales) {
      if (finalScore >= scale.min_score) {
        letterGrade = scale.letter_grade;
        break;
      }
    }

    grades.push({ subject: subject.name, score: finalScore, letterGrade });
  }

  return grades;
};