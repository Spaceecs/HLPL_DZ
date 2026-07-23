import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @ManyToOne(() => Order, (order: Order): OrderItem[] => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @ManyToOne(() => Product, { eager: true })
  product: Product;
}
