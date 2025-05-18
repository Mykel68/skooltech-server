import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Class from "./class.model";
import School from "./school.model";
import { ClassInstance, UserInstance } from "../types/models.types";

interface StudentAttributes {
  student_id: string;
  user_id: string;
  class_id: string;
  school_id: string;
}

interface StudentInstance extends Model<StudentAttributes>, StudentAttributes {
  user: UserInstance;
  class: ClassInstance;
}

const Student = sequelize.define<StudentInstance>(
  "Student",
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
      references: { model: User, key: "user_id" },
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Class, key: "class_id" },
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: School, key: "school_id" },
    },
  },
  {
    tableName: "students",
    timestamps: false,
    underscored: true,
  }
);

// Associations
Student.belongsTo(User, { foreignKey: "user_id" });
Student.belongsTo(Class, { foreignKey: "class_id" });
Student.belongsTo(School, { foreignKey: "school_id" });

User.hasOne(Student, { foreignKey: "user_id" });
Class.hasMany(Student, { foreignKey: "class_id" });
School.hasMany(Student, { foreignKey: "school_id" });

export default Student;
