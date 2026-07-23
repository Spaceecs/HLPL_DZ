import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Публічні ендпоінти — без Guard
  @Get()
  @ApiOperation({
    summary: 'Отримати всі продукти',
    description:
      'Повертає список усіх продуктів з вкладеними категоріями. Публічний ендпоінт.',
  })
  @ApiResponse({ status: 200, description: 'Список продуктів' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати продукт за ID' })
  @ApiResponse({ status: 200, description: 'Продукт знайдено' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // Захищені ендпоінти — тільки ADMIN
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створити продукт (admin)' })
  @ApiResponse({ status: 201, description: 'Продукт створено' })
  @ApiResponse({ status: 400, description: 'Помилка валідації' })
  @ApiResponse({ status: 401, description: 'Не авторизовано' })
  @ApiResponse({ status: 403, description: 'Недостатньо прав' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновити продукт (admin)' })
  @ApiResponse({ status: 200, description: 'Продукт оновлено' })
  @ApiResponse({ status: 404, description: 'Продукт не знайдено' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалити продукт (admin)' })
  @ApiResponse({ status: 200, description: 'Продукт видалено' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
