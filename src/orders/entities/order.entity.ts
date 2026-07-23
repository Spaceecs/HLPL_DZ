import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    eager: true,
    cascade: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}
