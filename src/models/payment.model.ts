import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import School from "./school.model";

export interface PaymentAttributes {
  payment_id?: string;
  student_id: string;
  school_id: string;
  amount: number;
  method: "Cash" | "Card" | "Transfer";
  description?: string;
  paid_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  "payment_id" | "description" | "paid_at" | "created_at" | "updated_at"
>;

export interface PaymentInstance
  extends Model<PaymentAttributes, PaymentCreationAttributes>,
    PaymentAttributes {}

const Payment = sequelize.define<PaymentInstance>(
  "Payment",
  {
    payment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: School,
        key: "school_id",
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM("Cash", "Card", "Transfer"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paid_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    underscored: true,
  }
);

export default Payment;
