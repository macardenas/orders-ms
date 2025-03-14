import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { isEmpty } from 'class-validator';
import { OrderPaginationDTO } from './dto/order-pagination.dto';
import { ChangeOrderDto } from './dto';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('orderservice-ms')
  @Inject(NATS_SERVICE) private readonly client: ClientProxy

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Connected');
  }

  async create(createOrderDto: CreateOrderDto) {


   

    try {

      const productIds = createOrderDto.items.map(item => item.productId)

      const products:any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products'},productIds)
      )

      const totalAmount = createOrderDto.items.reduce ((acc,orderitem) =>{
        const price =  products.find((product)=> product.id === orderitem.productId).price
        return price * orderitem.quantity;
      },0)

      const totalItems = createOrderDto.items.reduce ((acc,orderitem) =>{
        return acc + orderitem.quantity;
      },0)

      //3 crear un transaccion de base de datos
      const order = await this.order.create({
        data:{
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: products.find((product)=> product.id === item.productId).price
              }))
            }
          }
        },
        include: {
          OrderItem: {
            select:{
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      })

      return {
        ...order,
        OrderItem: order.OrderItem.map((item) => ({
          ...item,
          name: products.find((product) => product.id === item.productId).name
        }))
      };
      
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs'
      })
    }
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
      where: { id },
      include: {
        OrderItem: true
      }
    })

    if(!Order)throw new RpcException({
      message:`Producto no encontrado con el id: ${id}`,
      status: HttpStatus.NOT_FOUND
    })

    const productsIds = Order.OrderItem.map((product)=> product.productId);
    
    const products:any[] = await firstValueFrom(
      this.client.send({ cmd: 'validate_products'},productsIds)
    )
    
    return {
      ...Order,
      OrderItem: Order.OrderItem.map((product)=>({
        ...product,
        name: products.find((item) => item.id === product.productId).name
      }))
    }


    // return Order;
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
