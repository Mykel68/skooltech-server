import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

interface AttendanceLogAttributes {
  log_id?: string;
  student_id: string;
  class_id: string;
  session_id: string;
  term_id: string;
  school_id: string;
  date: Date;
  present: boolean;
}

export interface AttendanceLogInstance
  extends Model<AttendanceLogAttributes>,
    AttendanceLogAttributes {}

const AttendanceLog = sequelize.define<AttendanceLogInstance>(
  "AttendanceLog",
  {
    log_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    term_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    present: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "attendance_logs",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: [
          "student_id",
          "date",
          "class_id",
          "term_id",
          "session_id",
          "school_id",
        ],
      },
    ],
  }
);

export default AttendanceLog;
