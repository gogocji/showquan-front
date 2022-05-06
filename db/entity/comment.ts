import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article'
import { User } from './user'

@Entity({name: 'comments'})
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  content!: string;

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

  @ManyToOne(() => User)
  @JoinColumn({name: 'toUser_id'})
  toUser!: User;

  @ManyToOne(() => Comment)
  @JoinColumn({name: 'pid'})
  pComment!: Comment;

  @Column()
  is_delete!: number;

  @Column()
  like_count!: number;
}