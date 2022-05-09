import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';  
import { Follow } from './follow'

@Entity({ name: 'users' })  
export class User extends BaseEntity {  
 @PrimaryGeneratedColumn()  
 readonly id!: number;  

 @Column()  
 nickname!: string;  

 @Column()  
 avatar!: string;  

 @Column()  
 job!: string;  

 @Column()  
 introduce!: string;  

 @Column()  
 skill!: string;  
}
