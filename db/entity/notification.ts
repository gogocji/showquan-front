import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({name: 'notification'})
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  content!: string;

  @Column()
  title!: string;

  @Column()
  create_time!: Date;

  @Column()
  is_start!: number;

  @Column()
  type!: string;
}