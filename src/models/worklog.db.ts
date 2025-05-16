import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from "typeorm";
import { type IWorklog, WorkLocation } from "../types/worklog";
import { User } from "./user.db";
import { AppDataSource } from "../utils/db";

@Entity("worklogs")
@Index(["userId", "endTime"]) // Index for finding in-progress worklog
@Index(["userId", "startTime", "endTime"]) // Index for daily/weekly queries
@Index(["userId", "startTime"]) // Index for common queries
export class Worklog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime?: Date;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @Column({ type: "enum", enum: WorkLocation })
  location: WorkLocation;

  @Column({ type: "boolean", default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDTO(): IWorklog {
    return {
      id: this.id,
      userId: this.userId,
      startTime: this.startTime,
      endTime: this.endTime,
      description: this.description,
      location: this.location,
    };
  }
}

export const WorklogRepository = AppDataSource.getRepository(Worklog);
