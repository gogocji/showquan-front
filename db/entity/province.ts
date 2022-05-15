import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({name: 's_provinces'})
export class Province extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  cityName!: string;

  @Column()
  parentId!: number;

  @Column()
  shortName!: string;
  
  @Column()
  depth!: number;
  
  @Column()
  cityCode!: string;

  @Column()
  zipCode!: string;

  @Column()
  mergerName!: string;

  @Column()
  longitude!: string;

  @Column()
  latitude!: string;

  @Column()
  pinyin!: string;

  @Column()
  isUse!: number;
}