import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { RequestWithUser } from '@paris-2024/server-base-entity';
import { Cart } from '@paris-2024/server-data-access-cart';
import { CreateItemJunctionDto, ItemJunction } from '@paris-2024/server-data-access-item-junction';
import { ICartModel } from '@paris-2024/shared-interfaces';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  const mockCart: Cart = {
    id: 'cart-1',
    userId: 'user-1',
    guestToken: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };

  const mockGuestCart: Cart = {
    id: 'cart-2',
    userId: '',
    guestToken: 'guest-token-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };

  const mockItemJunction: ItemJunction = {
    id: 'junction-1',
    quantity: 2,
    bundleId: 'bundle-1',
    cartId: 'cart-1',
    orderId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };

  const mockCartWithBundles: ICartModel = {
    id: 'cart-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    bundles: [
      {
        quantity: 2,
        junction: 'junctionId',
          id: 'bundle-1',
          name: 'Test Bundle',
          price: 100,
          amount: 2,
        
      }
    ]
  };

  const mockCartService = {
    createUserCart: jest.fn(),
    createGuestCart: jest.fn(),
    getCartWithBundles: jest.fn(),
    addToCart: jest.fn(),
    updateItemQuantity: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService
        }
      ]
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCart', () => {
    it('should create a cart for a logged-in user', async () => {
      const req: RequestWithUser = {
        user: { id: 'user-1' }
      } as RequestWithUser;

      mockCartService.createUserCart.mockResolvedValue(mockCart);

      const result = await controller.createCart(req, '');

      expect(cartService.createUserCart).toHaveBeenCalledWith('user-1');
      expect(cartService.createGuestCart).not.toHaveBeenCalled();
      expect(result).toEqual(mockCart);
    });

    it('should create a cart for a guest user with token', async () => {
      const req: RequestWithUser = {} as RequestWithUser;
      const guestToken = 'guest-token-123';

      mockCartService.createGuestCart.mockResolvedValue(mockGuestCart);

      const result = await controller.createCart(req, guestToken);

      expect(cartService.createUserCart).not.toHaveBeenCalled();
      expect(cartService.createGuestCart).toHaveBeenCalledWith(guestToken);
      expect(result).toEqual(mockGuestCart);
    });
  });

  describe('getCart', () => {
    it('should get cart with bundles for a logged-in user', async () => {
      const req: RequestWithUser = {
        user: { id: 'user-1' }
      } as RequestWithUser;

      mockCartService.getCartWithBundles.mockResolvedValue(mockCartWithBundles);

      const result = await controller.getCart(req, '');

      expect(cartService.getCartWithBundles).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(result).toEqual(mockCartWithBundles);
    });

    it('should get cart with bundles for a guest user with token', async () => {
      const req: RequestWithUser = {} as RequestWithUser;
      const guestToken = 'guest-token-123';

      mockCartService.getCartWithBundles.mockResolvedValue(mockCartWithBundles);

      const result = await controller.getCart(req, guestToken);

      expect(cartService.getCartWithBundles).toHaveBeenCalledWith({ guestToken });
      expect(result).toEqual(mockCartWithBundles);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart for a logged-in user', async () => {
      const req: RequestWithUser = {
        user: { id: 'user-1' }
      } as RequestWithUser;
      
      const dto: CreateItemJunctionDto = {
        quantity: 2,
        bundleId: 'bundle-1'
      };

      mockCartService.addToCart.mockResolvedValue(mockItemJunction);

      const result = await controller.addToCart(req, '', dto);

      expect(cartService.addToCart).toHaveBeenCalledWith({ userId: 'user-1' }, dto);
      expect(result).toEqual(mockItemJunction);
    });

    it('should add item to cart for a guest user with token', async () => {
      const req: RequestWithUser = {} as RequestWithUser;
      const guestToken = 'guest-token-123';
      
      const dto: CreateItemJunctionDto = {
        quantity: 2,
        bundleId: 'bundle-1'
      };

      mockCartService.addToCart.mockResolvedValue(mockItemJunction);

      const result = await controller.addToCart(req, guestToken, dto);

      expect(cartService.addToCart).toHaveBeenCalledWith({ guestToken }, dto);
      expect(result).toEqual(mockItemJunction);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity for a logged-in user', async () => {
      const req: RequestWithUser = {
        user: { id: 'user-1' }
      } as RequestWithUser;
      
      const dto = {
        itemJunctionId: 'junction-1',
        quantity: 3,
        bundleId: 'bundle123'
      };

      mockCartService.updateItemQuantity.mockResolvedValue(mockItemJunction);

      const result = await controller.updateQuantity(req, '', dto);

      expect(cartService.updateItemQuantity).toHaveBeenCalledWith({ userId: 'user-1' }, dto);
      expect(result).toEqual(mockItemJunction);
    });

    it('should update item quantity for a guest user with token', async () => {
      const req: RequestWithUser = {} as RequestWithUser;
      const guestToken = 'guest-token-123';
      
      const dto = {
        itemJunctionId: 'junction-1',
        quantity: 3,
        bundleId: 'bundle123'
      };

      mockCartService.updateItemQuantity.mockResolvedValue(mockItemJunction);

      const result = await controller.updateQuantity(req, guestToken, dto);

      expect(cartService.updateItemQuantity).toHaveBeenCalledWith({ guestToken }, dto);
      expect(result).toEqual(mockItemJunction);
    });
  });
});