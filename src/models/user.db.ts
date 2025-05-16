import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { IUser } from "../types/user";
import { AppDataSource } from "../utils/db";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "float", default: 0 })
  balance: number;

  @Column({ type: "varchar", nullable: true })
  oidcId?: string;

  @Column({ type: "varchar", nullable: true })
  email?: string;

  @Column({ type: "varchar", nullable: true })
  name?: string;

  @Column({ type: "boolean", default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDTO(): IUser {
    return {
      id: this.id,
      balance: this.balance,
      oidcId: this.oidcId,
      email: this.email,
      name: this.name,
    };
  }
}

export const UserRepository = AppDataSource.getRepository(User);
