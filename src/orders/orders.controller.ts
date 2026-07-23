import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Створити нове замовлення' })
  @ApiResponse({ status: 201, description: 'Замовлення створено', type: Order })
  create(@Body() dto: CreateOrderDto, @CurrentUser('sub') userId: number) {
    return this.ordersService.create(dto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Список замовлень (користувач бачить свої, адмін — всі)',
  })
  @ApiResponse({ status: 200, description: 'Список замовлень' })
  findAll(
    @Query() query: OrderQueryDto,
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: Role,
  ) {
    return this.ordersService.findAll(query, userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати замовлення за ID з перевіркою ownership' })
  @ApiResponse({ status: 200, description: 'Деталі замовлення' })
  @ApiResponse({
    status: 403,
    description: 'Доступ заборонено (чуже замовлення)',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: Role,
  ) {
    return this.ordersService.findOne(id, userId, role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Змінити статус замовлення (тільки для ADMIN)' })
  @ApiResponse({ status: 200, description: 'Статус оновлено' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Видалити замовлення (тільки для ADMIN)' })
  @ApiResponse({ status: 200, description: 'Замовлення видалено' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
