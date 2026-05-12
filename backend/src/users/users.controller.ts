import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtGuard, AdminGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(+id);
  }
}
