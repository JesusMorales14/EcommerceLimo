import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.auth.getProfile(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.auth.updateProfile(req.user.id, body);
  }
}
