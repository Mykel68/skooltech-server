import { Optional, Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

interface SchoolSequenceAttributes {
  school_id: string;
  year: number;
  last_sequence: number;
}

// Fix: Make school_id and year optional for creation!
type SchoolSequenceCreationAttributes = Optional<
  SchoolSequenceAttributes,
  "school_id" | "year"
>;

export interface SchoolSequenceInstance
  extends Model<SchoolSequenceAttributes, SchoolSequenceCreationAttributes>,
    SchoolSequenceAttributes {}

const SchoolSequence = sequelize.define<SchoolSequenceInstance>(
  "SchoolSequence",
  {
    school_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    year: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    last_sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "school_sequences",
    timestamps: true,
    underscored: true,
  }
);

export default SchoolSequence;
