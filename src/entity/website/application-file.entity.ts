import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user';

@Entity('files')
export class ApplicationFile {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  filePath: string;

  @Column()
  @ApiProperty()
  userId: number;

  @ManyToOne(() => User) // Assuming you have a UserEntity to represent the user
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  @ApiProperty()
  uploadDate: Date;

  @Column({ nullable: true })
  @ApiProperty({ required: false })
  applicationId?: string;
}
