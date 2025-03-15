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
  async getUserByOidcId(oidcId: string): Promise<IUser | null> {
    const user = await User.findOne({
      oidcId,
      deleted: { $ne: true },
    });
    return user ? this.toUser(user) : null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({
      email,
      deleted: { $ne: true },
    });
    return user ? this.toUser(user) : null;
  }

  async modifyUser(id: string, user: Partial<Omit<IUser, "id" | "balance">>): Promise<IUser> {
    const doc = await User.findById(id);
    if (!doc) {
      throw new Error("User not found");
    }
    if (user.oidcId !== undefined) {
      doc.oidcId = user.oidcId;
    }
    if (user.email !== undefined) {
      doc.email = user.email;
    }
    if (user.name !== undefined) {
      doc.name = user.name;
    }
    await doc.save();
    return this.toUser(doc);
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
