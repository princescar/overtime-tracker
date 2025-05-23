import { UserRepository } from "#/models/user.db";
import type { IUser } from "#/types/user";

export class UserService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<IUser[]> {
    const users = await UserRepository.find({
      where: { deleted: false },
    });
    return users.map((user) => user.toDTO());
  }

  /**
   * Get user by OIDC ID
   */
  async getUserByOidcId(oidcId: string): Promise<IUser | null> {
    const user = await UserRepository.findOne({
      where: {
        oidcId,
        deleted: false,
      },
    });
    return user ? user.toDTO() : null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await UserRepository.findOne({
      where: {
        email,
        deleted: false,
      },
    });
    return user ? user.toDTO() : null;
  }

  async modifyUser(id: string, userData: Partial<Omit<IUser, "id" | "balance">>): Promise<IUser> {
    const user = await UserRepository.findOne({
      where: { id, deleted: false },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (userData.oidcId !== undefined) {
      user.oidcId = userData.oidcId;
    }
    if (userData.email !== undefined) {
      user.email = userData.email;
    }
    if (userData.name !== undefined) {
      user.name = userData.name;
    }

    await UserRepository.save(user);
    return user.toDTO();
  }
}
