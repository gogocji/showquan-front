import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { Comment } from './comment'
import { User } from './user'
import { Tag } from './tag'

@Entity({name: 'articles'})
export class Article extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  content!: string;

  @Column()
  headImg!: string;

  @Column()
  views!: number;

  @Column()
  like_count!: number;

  @Column()
  comment_count!: number;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;

  @Column()
  is_delete!: number;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @OneToMany(() => Comment, (comment) => comment.article)
  comments!: Comment[]

  @ManyToMany(() => Tag, (tag) => tag.articles, {
    cascade: true
  })
  tags!: Tag[]
}