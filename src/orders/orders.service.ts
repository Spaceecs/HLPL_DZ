import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface RedisStoreType {
  keys?: (pattern: string) => Promise<string[]>;
  client?: {
    keys?: (pattern: string) => Promise<string[]>;
  };
}

interface CacheWithStore extends Cache {
  store?: RedisStoreType;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private async clearProductsCache(): Promise<void> {
    try {
      const cache = this.cacheManager as CacheWithStore;
      const store = cache.store;

      let keys: string[] = [];
      if (store) {
        if (typeof store.keys === 'function') {
          keys = await store.keys('products:*');
        } else if (store.client && typeof store.client.keys === 'function') {
          keys = await store.client.keys('products:*');
        }
      }

      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      }
    } catch {
      // Ignore cache clearing errors
    }
  }

  async create(dto: CreateOrderDto, userId: number): Promise<Order> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of dto.items) {
        const product = await qr.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product #${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}": available ${product.stock}, requested ${item.quantity}`,
          );
        }

        product.stock -= item.quantity;
        await qr.manager.save(product);

        const orderItem = qr.manager.create(OrderItem, {
          product,
          quantity: item.quantity,
          price: product.price,
        });
        orderItems.push(orderItem);

        totalPrice += Number(product.price) * item.quantity;
      }

      const order = qr.manager.create(Order, {
        user: { id: userId } as User,
        items: orderItems,
        totalPrice,
        status: OrderStatus.PENDING,
      });

      const saved = await qr.manager.save(order);
      await qr.commitTransaction();
      await this.clearProductsCache();

      return saved;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  async findAll(query: OrderQueryDto, userId: number, userRole: Role) {
    const { page = 1, pageSize = 10, status } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('order.user', 'user');

    if (userRole !== Role.ADMIN) {
      qb.andWhere('user.id = :userId', { userId });
    }

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number, userId: number, userRole: Role): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (userRole !== Role.ADMIN && order.user.id !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    const currentStatus = order.status;
    const newStatus = dto.status;

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${newStatus}"`,
      );
    }

    // Return stock on order cancellation
    if (
      newStatus === OrderStatus.CANCELLED &&
      currentStatus !== OrderStatus.CANCELLED
    ) {
      const qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();

      try {
        const itemsList = (order.items ?? []) as OrderItem[];
        for (const item of itemsList) {
          if (item.product) {
            const product = await qr.manager.findOne(Product, {
              where: { id: item.product.id },
            });
            if (product) {
              product.stock += item.quantity;
              await qr.manager.save(product);
            }
          }
        }

        order.status = newStatus;
        const saved = await qr.manager.save(order);
        await qr.commitTransaction();
        await this.clearProductsCache();
        return saved;
      } catch (error) {
        await qr.rollbackTransaction();
        throw error;
      } finally {
        await qr.release();
      }
    }

    order.status = newStatus;
    return this.orderRepo.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    await this.orderRepo.remove(order);
  }
}
