import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ProductQueryDto } from './dto/product-query.dto';

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
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
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
      // Ігноруємо помилки очищення кешу, якщо сховище не підтримує пошук ключів
    }
  }

  async findAll(query: ProductQueryDto) {
    const cacheKey = `products:${JSON.stringify(query)}`;

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        console.log('📦 Отримано з REDIS кешу');
        return cached;
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error('⚠️ Помилка читання з кешу:', errorMessage);
    }

    const {
      page = 1,
      pageSize = 10,
      sort = 'createdAt',
      order = 'desc',
      categoryId,
      minPrice,
      maxPrice,
      search,
    } = query;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (categoryId) qb.andWhere('category.id = :categoryId', { categoryId });
    if (minPrice !== undefined)
      qb.andWhere('product.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined)
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    if (search)
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });

    qb.orderBy(`product.${sort}`, order.toUpperCase() as 'ASC' | 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    const result = {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };

    try {
      await this.cacheManager.set(cacheKey, result, 60_000);
      console.log('✅ Успішно збережено в REDIS:', cacheKey);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error('⚠️ Помилка запису в кеш:', errorMessage);
    }

    return result;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 0,
      category: dto.categoryId ? { id: dto.categoryId } : undefined,
    });
    const saved = await this.productRepo.save(product);
    await this.clearProductsCache();
    return saved;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.stock !== undefined) product.stock = dto.stock;

    if (dto.categoryId !== undefined) {
      product.category = { id: dto.categoryId } as typeof product.category;
    }

    const saved = await this.productRepo.save(product);
    await this.clearProductsCache();
    return saved;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    await this.clearProductsCache();
  }
}
