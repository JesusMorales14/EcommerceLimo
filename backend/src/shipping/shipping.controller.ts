import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private service: ShippingService) {}

  // crear shipping
  @Post()
  create(@Body() body) {
    return this.service.create(body);
  }

  // obtener por order
  @Get('order/:orderId')
  getByOrder(@Param('orderId') orderId: string) {
    return this.service.findByOrder(Number(orderId));
  }

  // actualizar estado
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(Number(id), status);
  }

  // TRACKING (timeline)
  @Get(':id/tracking')
  async getTracking(@Param('id') id: string) {
    const events = await this.service.getTracking(Number(id));

    return events.map((e) => ({
      status: e.status,
      label: this.mapStatus(e.status),
      date: e.createdAt,
    }));
  }

  private mapStatus(status: string) {
    const map = {
      pending: 'Pedido creado',
      shipped: 'Enviado',
      delivered: 'Entregado',
    };

    return map[status] || status;
  }
}
