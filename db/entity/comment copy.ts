import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article'
import { User } from './user'

@Entity({name: 'thumbs'})
export class Thumb extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @ManyToOne(() => Article)
  @JoinColumn({name: 'article_id'})
  article!: Article;
}