import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';  
import { Article } from './article'

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

 @Column()  
 state!: number;  

 @Column()  
 province?: string;  

 @Column()  
 city?: string;  

 @Column()  
 longitude?: string;  

 @Column()  
 latitude?: string;  
}
