import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Query, Request } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequestWithUser } from "@paris-2024/server-base-entity";
import { CartService } from "@paris-2024/server-business-logic-cart";
import { AddToCartDto, Cart } from "@paris-2024/server-data-access-cart";
import { CreateItemJunctionDto, ItemJunction } from "@paris-2024/server-data-access-item-junction";
import { ICartModel } from "@paris-2024/shared-interfaces";

@ApiTags('cart')
@ApiInternalServerErrorResponse()
@Controller('cart')
export class CartController {
  private noIdentifierError = 'User is not logged and guestToken query parameter is missing.'

  constructor(private cartService: CartService) {}

  @Post()
  @ApiCreatedResponse({
    type: Cart,
    description: 'creates new cart with userId or guestToken (query parameter)',
  })
  @ApiBadRequestResponse()
  createCart(
    @Request() req: RequestWithUser,
    @Query('guestToken') guestToken: string,
  ): Promise<Cart | undefined> {
    const userId = req.user?.id;
    if(userId) {
      return this.cartService.createUserCart(userId)
    }
    if(guestToken) {
      return this.cartService.createGuestCart(guestToken)
    }
    throw new HttpException(this.noIdentifierError, HttpStatus.BAD_REQUEST);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'returns cart with associated bundles',
    type: Cart,
  })
  getCart(
    @Request() req: RequestWithUser, 
    @Query('guestToken') guestToken: string,
  ): Promise<ICartModel | null> {
    const userId = req.user?.id;
    if (userId) {
      return this.cartService.getCartWithBundles({ userId: userId });
    }
    if (guestToken) {
      return this.cartService.getCartWithBundles({ guestToken: guestToken }); 
    }
    throw new HttpException(this.noIdentifierError, HttpStatus.BAD_REQUEST);
  }

  @Post('add-to')
  @ApiBody({
    type: CreateItemJunctionDto,
  })
  @ApiBadRequestResponse()
  addToCart(
    @Request() req: RequestWithUser, 
    @Query('guestToken') guestToken: string,
    @Body() dto: CreateItemJunctionDto, 
  ): Promise<ItemJunction | undefined> {
    const userId = req.user?.id;
    if (userId) {
      return this.cartService.addToCart({ userId }, dto);
    }
    if(guestToken) {
      return this.cartService.addToCart({ guestToken }, dto);
    }
    throw new HttpException(this.noIdentifierError, HttpStatus.BAD_REQUEST);
  }

  @Patch('add-to')
  @ApiBody({
    type: CreateItemJunctionDto,
  })
  @ApiBadRequestResponse()
  updateQuantity(
    @Request() req: RequestWithUser, 
    @Query('guestToken') guestToken: string,
    @Body() dto: AddToCartDto
    ): Promise<ItemJunction | null> {
    const userId = req.user?.id;
    if (userId) {
      return this.cartService.updateItemQuantity({ userId }, dto);
    }
    if(guestToken) {
      return this.cartService.updateItemQuantity({ guestToken }, dto);
    }
    throw new HttpException(this.noIdentifierError, HttpStatus.BAD_REQUEST);
  }
}
