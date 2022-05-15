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
  publish_time!: Date;

  @Column()
  is_delete!: number;
}