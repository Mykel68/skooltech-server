import { User, Role, UserRole } from "../models";

export const getUserWithRoles = async (userId: string) => {
  return await User.findByPk(userId, {
    include: [{ model: Role, through: { attributes: [] } }],
  });
};

export const assignRoleToUser = async (userId: string, roleId: number) => {
  return await UserRole.create({ user_id: userId, role_id: roleId });
};

export const removeRoleFromUser = async (userId: string, roleId: number) => {
  return await UserRole.destroy({
    where: { user_id: userId, role_id: roleId },
  });
};

export const listUserRoles = async (userId: string) => {
  const user = await getUserWithRoles(userId);
  return user?.roles?.map((r: any) => r.role_id) || [];
};
