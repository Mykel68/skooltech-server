import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db'; 
import User from './user.model';
import Class from './class.model';
import School from './school.model';

class Student extends Model {
  public student_id!: string;
  public user_id!: string;
  public class_id!: string;
  public school_id!: string;
}

Student.init(
  {
    student_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'user_id' },
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'classes', key: 'class_id' },
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'schools', key: 'school_id' },
    },
  },
  {
    sequelize,
    tableName: 'students',
    timestamps: false,
  }
);

Student.belongsTo(User, { foreignKey: 'user_id' });
Student.belongsTo(Class, { foreignKey: 'class_id' });
Student.belongsTo(School, { foreignKey: 'school_id' });
User.hasOne(Student, { foreignKey: 'user_id' });
Class.hasMany(Student, { foreignKey: 'class_id' });
School.hasMany(Student, { foreignKey: 'school_id' });

export default Student;