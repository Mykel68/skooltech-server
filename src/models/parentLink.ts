import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

interface ParentLinkAttributes {
  parent_user_id: string;
  child_user_id: string;
  is_approved: boolean;
}

interface ParentLinkCreationAttributes
  extends Optional<ParentLinkAttributes, "parent_user_id"> {}

export type ParentLinkInstance = Model<
  ParentLinkAttributes,
  ParentLinkCreationAttributes
> &
  ParentLinkAttributes;

// Define the model with typings for instance and creation attributes
const ParentLink = sequelize.define<
  Model<ParentLinkAttributes, ParentLinkCreationAttributes>
>(
  "ParentLink",
  {
    parent_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    child_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "parent_links",
    timestamps: true,
  }
);

// Association

export default ParentLink;
