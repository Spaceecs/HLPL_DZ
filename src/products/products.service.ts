import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      relations: ['category'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    categoryId?: number;
  }): Promise<Product> {
    const product = this.productRepo.create({
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock ?? 0,
      category: data.categoryId ? { id: data.categoryId } : null,
    } as any);
    return this.productRepo.save(product);
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
      isActive: boolean;
      categoryId: number;
    }>,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.isActive !== undefined) product.isActive = data.isActive;
    if (data.categoryId !== undefined) {
      product.category = { id: data.categoryId } as any;
    }
    return this.productRepo.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
  }
}
