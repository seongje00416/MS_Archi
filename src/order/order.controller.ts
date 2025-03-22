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

  @Get(':orderId')
  @ApiOperation({ summary: '주문 조회' })
  @ApiResponse({ status: 201, description: '조회 완료' })
  @ApiResponse({ status: 401, description: '조회 실패' })
  @ApiParam({ name: 'orderId', description: '주문 ID' })
  async getOrder(@Param('orderId') orderId: string) {
    this.logger.log(`Request to get order: ${orderId}`);

    const order = await this.ordersService.getOrder(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    const seoulFormatter = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    order.receiveDate = seoulFormatter.format(new Date());
    this.logger.log(`Request Time:` + order.receiveDate);

    return order;
  }
}
