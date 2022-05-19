import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user'
// TODO: 待完善
@Entity({name: 'follows'})
export class Follow extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  hasLike!: number;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @ManyToOne(() => User)
  @JoinColumn({name: 'byUser_id'})
  byUser!: User;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;
}