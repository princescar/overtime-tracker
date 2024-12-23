import { type IUserDocument, User } from "#/models/user.db";
import type { IUser } from "#/types/user";

export class UserService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find({ deleted: { $ne: true } });
    return users.map((user) => this.toUser(user));
  }

  /**
   * Get user by OIDC ID
   */
  async getUserByOidcId(oidcId: string): Promise<IUser> {
    const user = await User.findOne({
      oidcId,
      deleted: { $ne: true },
    });
    if (!user) {
      throw new Error(`Cannot find user with OIDC ID ${oidcId}`);
    }
    return this.toUser(user);
  }

  /**
   * Transform user document to business object
   */
  private toUser(doc: IUserDocument): IUser {
    return {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      id: doc._id.toString(),
      balance: doc.balance,
    };
  }
}
