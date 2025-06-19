// models/associations.ts

import Class from './class.model';
import School from './school.model';
import User from './user.model';
import Subject from './subject.model';
import ClassStudent from './class_student.model';
import ClassTeacher from './class_teacher.model';
import Attendance from './attendance.model';
import Session from './session.model';
import GradingSetting from './grading_setting.model';
import StudentScore from './student_score.model';
import Term from './term.model';

// === CLASS associations ===
Class.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(Class, { foreignKey: 'school_id' });

Class.hasMany(ClassStudent, {
	as: 'class_students',
	foreignKey: 'class_id',
});

Class.belongsTo(User, {
	as: 'class_teacher',
	foreignKey: 'teacher_id',
});

Class.hasMany(Subject, {
	as: 'subjects',
	foreignKey: 'class_id',
});

// === ATTENDANCE associations ===
Attendance.belongsTo(Class, { foreignKey: 'class_id' });
Attendance.belongsTo(Session, { foreignKey: 'session_id' });
Attendance.belongsTo(Term, { foreignKey: 'term_id' });
Attendance.belongsTo(User, {
	foreignKey: 'student_id',
	as: 'student',
});
User.hasMany(Attendance, {
	foreignKey: 'student_id',
	as: 'attendances',
});

// === CLASS STUDENT associations ===
ClassStudent.belongsTo(Class, { foreignKey: 'class_id' });

ClassStudent.belongsTo(User, {
	foreignKey: 'student_id',
	as: 'student',
});
User.hasMany(ClassStudent, {
	foreignKey: 'student_id',
	as: 'class_students',
});

ClassStudent.belongsTo(Session, { foreignKey: 'session_id' });
ClassStudent.belongsTo(Term, { foreignKey: 'term_id' });

// === CLASS TEACHER associations ===
ClassTeacher.belongsTo(Class, {
	foreignKey: 'class_id',
	as: 'class',
});
Class.hasMany(ClassTeacher, {
	foreignKey: 'class_id',
	as: 'class_teachers',
});

ClassTeacher.belongsTo(User, {
	foreignKey: 'teacher_id',
	as: 'teacher',
});
User.hasMany(ClassTeacher, {
	foreignKey: 'teacher_id',
	as: 'teacher_classes',
});

ClassTeacher.belongsTo(Session, {
	foreignKey: 'session_id',
	as: 'session',
});

ClassTeacher.belongsTo(Term, {
	foreignKey: 'term_id',
	as: 'term',
});

GradingSetting.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
GradingSetting.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
GradingSetting.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
GradingSetting.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

Session.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(Session, { foreignKey: 'school_id' });

StudentScore.belongsTo(User, { foreignKey: 'user_id', as: 'student' });
StudentScore.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
StudentScore.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
StudentScore.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
StudentScore.belongsTo(GradingSetting, {
	foreignKey: 'grading_setting_id',
	as: 'grading_setting',
});
StudentScore.belongsTo(Subject, {
	foreignKey: 'subject_id',
	as: 'subject',
});
StudentScore.belongsTo(ClassStudent, {
	foreignKey: 'class_id',
	as: 'class_student',
});

User.hasMany(StudentScore, {
	foreignKey: 'user_id',
	as: 'student_scores',
});

Subject.belongsTo(School, { foreignKey: 'school_id' });
School.hasMany(Subject, { foreignKey: 'school_id' });

Subject.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

Subject.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
Subject.belongsTo(Term, { foreignKey: 'term_id', as: 'term' });

Subject.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
User.hasMany(Subject, { foreignKey: 'teacher_id', as: 'subjects' });

Term.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
School.hasMany(Term, { foreignKey: 'school_id', as: 'terms' });

Term.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
Session.hasMany(Term, { foreignKey: 'session_id', as: 'terms' });

User.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
School.hasMany(User, { foreignKey: 'school_id', as: 'users' });

User.hasMany(Class, { foreignKey: 'teacher_id', as: 'taught_classes' });

export const applyAssociations = () => {
	// Intentionally empty. Running this file will apply all associations.
};
