import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user'
// TODO: 待完善
@Entity({name: 'follows'})
export class Follow extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  is_del!: number;

  @ManyToMany(() => User)
  // 这里是建立了一个关联表，因为是多对多的关系
  @JoinTable({
    name: 'follows_users_rel',
    joinColumn: {
      name: 'follow_id'
    },
    inverseJoinColumn: {
      name: 'user_id'
    }
  })
  user!: User

  @ManyToMany(() => User)
  // 这里是建立了一个关联表，因为是多对多的关系
  @JoinTable({
    name: 'follows_users_rel',
    joinColumn: {
      name: 'follow_id'
    },
    inverseJoinColumn: {
      name: 'byUser_id'
    }
  })
  byUsers!: User[]

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;
}