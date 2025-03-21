import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './order.service';

@Controller('api/orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    this.logger.log(`Request to get order: ${orderId}`);

    const order = await this.ordersService.getOrder(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }
}
