import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { isEmpty } from 'class-validator';
import { OrderPaginationDTO } from './dto/order-pagination.dto';
import { ChangeOrderDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('orderservice-ms')

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Connected');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto
    })
  }

  async findAll(OrderPaginaDto: OrderPaginationDTO) {
    const totalpages = await this.order.count({
      where:{ status: OrderPaginaDto.status }
    })

    const currentPage = OrderPaginaDto.page;
    const perPage = OrderPaginaDto.limit

    return {
      data: await this.order.findMany({
        skip: ( currentPage -1) * perPage,
        take: perPage,
        where:{
          status: OrderPaginaDto.status
        }
      }),
      metadata:{
        total: totalpages,
        page: currentPage,
        lastPage: Math.ceil( totalpages / perPage )
      }
    }
  }

  async findOne(id: string) {

    let Order = await this.order.findUnique({
      where: { id }
    })

    if(!Order)throw new RpcException({
      message:`Producto no encontrado con el id: ${id}`,
      status: HttpStatus.NOT_FOUND
    })

    return Order;
  }

  async ChangeOrderStatus(changeOrderDto: ChangeOrderDto){

    const { id, status } = changeOrderDto;

    const order = await this.findOne(id)
    if( order.status == status ){
      return order;
    }

    return await this.order.update({
      where:{ id },
      data: { status }
    })

  }

}
