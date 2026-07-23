import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @ApiResponse({
    status: 201,
    description: 'Користувача успішно зареєстровано',
  })
  @ApiResponse({
    status: 400,
    description: 'Помилка валідації або email вже зайнятий',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Автентифікація користувача' })
  @ApiResponse({
    status: 200,
    description: 'Успішний вхід, повернено access_token',
  })
  @ApiResponse({ status: 401, description: 'Невірні облікові дані' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
