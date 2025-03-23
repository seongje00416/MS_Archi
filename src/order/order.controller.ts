import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './order.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('/api/orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  getNowTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const millisStr = String(now.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millisStr}`;
  }

  @Get('/redis/:orderId')
  @ApiOperation({ summary: '주문 조회' })
  @ApiResponse({ status: 201, description: '조회 완료' })
  @ApiResponse({ status: 401, description: '조회 실패' })
  @ApiParam({ name: 'orderId', description: '주문 ID' })
  async getOrderRedis(@Param('orderId') orderId: string) {
    this.logger.log(`[Redis] Request to get order: ${orderId}`);

    const order = await this.ordersService.getOrderRedis(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    order.receiveDate = this.getNowTime();
    this.logger.log(`Request Time:` + order.receiveDate);

    return order;
  }

  @Get('/rabbitmq/:orderId')
  @ApiOperation({ summary: '주문 조회' })
  @ApiResponse({ status: 201, description: '조회 완료' })
  @ApiResponse({ status: 401, description: '조회 실패' })
  @ApiParam({ name: 'orderId', description: '주문 ID' })
  async getOrderRabbitMQ(@Param('orderId') orderId: string) {
    this.logger.log(`[RabbitMQ] Request to get order: ${orderId}`);

    const order = await this.ordersService.getOrderRabbitMQ(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    order.receiveDate = this.getNowTime();
    this.logger.log(`Request Time:` + order.receiveDate);

    return order;
  }

  @Get('/kafka/:orderId')
  @ApiOperation({ summary: '주문 조회' })
  @ApiResponse({ status: 201, description: '조회 완료' })
  @ApiResponse({ status: 401, description: '조회 실패' })
  @ApiParam({ name: 'orderId', description: '주문 ID' })
  async getOrderKafka(@Param('orderId') orderId: string) {
    this.logger.log(`[Kafka] Request to get order: ${orderId}`);

    const order = await this.ordersService.getOrderKafka(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    order.receiveDate = this.getNowTime();
    this.logger.log(`Request Time:` + order.receiveDate);

    return order;
  }
}
