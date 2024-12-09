import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Entity untuk log yang merepresentasikan tabel 'audit-log'.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  entity: string;

  @Column('varchar')
  operation: string;

  @Column('text')
  changes: string;

  @CreateDateColumn()
  timestamp: Date;
}
