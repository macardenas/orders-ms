import { Controller, NotImplementedException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ChangeOrderDto, CreateOrderDto, OrderPaginationDTO } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd:'createOrder'})  
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  

  @MessagePattern({ cmd: 'findAllOrders' })
  findAll(@Payload() OrderPaginationDto: OrderPaginationDTO) {
    console.log("Voy a buscar las ordenes")
    return this.ordersService.findAll(OrderPaginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('changestatus')
  changestatus(
    @Payload() changeOrderDto: ChangeOrderDto
  ) {
    return this.ordersService.ChangeOrderStatus(changeOrderDto);
  }
}
