import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemsCheckoutDto } from '../dtos/items-checkout.dto';

@Entity('checkouts')
export class Checkout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('jsonb')
  items: ItemsCheckoutDto[];

  @Column('float')
  totalPrice: number;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
