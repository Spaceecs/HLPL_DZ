import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CreateUsers1784826037058 } from './migrations/1784826037058-CreateUsers';
import { CreateTables1700000001234 } from './migrations/1700000001234-CreateTables';
import { AddIsActiveToProducts1784814806891 } from './migrations/1784814806891-AddIsActiveToProducts';
import { User } from './users/user.entity';
import { OrdersModule } from './orders/orders.module';
import { AddCategoryToProducts1710000000000 } from './migrations/1710000000000-AddCategoryToProducts';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CreateOrdersTable1784834763070 } from './migrations/1784834763070-CreateOrdersTable';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Category, Product, User, Order, OrderItem],
      synchronize: false,
      migrationsRun: true,
      migrations: [
        CreateTables1700000001234,
        AddIsActiveToProducts1784814806891,
        CreateUsers1784826037058,
        AddCategoryToProducts1710000000000,
        CreateOrdersTable1784834763070,
      ],
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'redis'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        });
        return {
          store: () => store,
          ttl: 60 * 1000, // 60 секунд
        };
      },
    }),

    CategoriesModule,
    ProductsModule,
    AuthModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
