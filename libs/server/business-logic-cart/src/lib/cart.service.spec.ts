it.todo('FIX THOSE!')

// import { Test, TestingModule } from '@nestjs/testing';
// import { CartService } from './cart.service';
// import { CartRepository } from '@paris-2024/server-data-access-cart';
// import { ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';

// describe('CartService', () => {

//   const mockUserCart = {
//     id: 'cart123',
//     userId: 'user123',
//     guestToken: '',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     deletedAt: null,
//   };

//   const mockGuestCart = {
//     id: '2',
//     userId: '',
//     guestToken: 'token123',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     deletedAt: null,
//   };

//   const bundlesArray = [
//     { id: 'bundle1', name: 'Bundle 1', price: 100, ticketAmount: 3, isAvailable: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null  },
//     { id: 'bundle2', name: 'Bundle 2', price: 150, ticketAmount: 4, isAvailable: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null  }
//   ]
//   const bundlesWithQuantity = [ { bundle: bundlesArray[0], quantity: 2 },{ bundle: bundlesArray[1], quantity: 2 },]

//   const mockJunctions = [
//     { id: 'junction1', quantity: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, bundle: { id: 'bundle1', name: 'Bundle 1', price: 100, ticketAmount: 3, isAvailable: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null  } },
//     { id: 'junction2', quantity: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, bundle: { id: 'bundle2', name: 'Bundle 2', price: 150, ticketAmount: 4, isAvailable: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null  } }
//   ];

//   let service: CartService;
//   let cartRepositoryMock: jest.Mocked<CartRepository>;
//   let itemJunctionRepositoryMock: jest.Mocked<ItemJunctionRepository>;

//   beforeEach(async () => {
//     cartRepositoryMock = {
//       getCart: jest.fn(),
//       getUserCart: jest.fn(),
//       getGuestCart: jest.fn(),
//       createUserCart: jest.fn(),
//       createGuestCart: jest.fn(),
//       update: jest.fn(),
//     } as unknown as jest.Mocked<CartRepository>;

//     itemJunctionRepositoryMock = {
//       getManyByRelationshipId: jest.fn(),
//       getOne: jest.fn(),
//       updateQuantity: jest.fn(),
//       mergeJunctions: jest.fn(),
//     } as unknown as jest.Mocked<ItemJunctionRepository>;

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         CartService,
//         { provide: CartRepository, useValue: cartRepositoryMock },
//         { provide: ItemJunctionRepository, useValue: itemJunctionRepositoryMock },
//       ],
//     }).compile();

//     service = module.get<CartService>(CartService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('getCartWithBundles', () => {
//     it('should return null when cart is not found', async () => {
//       const identifier = { userId: 'user123' };
//       cartRepositoryMock.getCart.mockResolvedValue(null);

//       const result = await service.getCartWithBundles(identifier);

//       expect(result).toBeNull();
//       expect(cartRepositoryMock.getCart).toHaveBeenCalledWith(identifier);
//       expect(itemJunctionRepositoryMock.getManyByRelationshipId).not.toHaveBeenCalled();
//     });

//     it('should return cart with empty bundles when no junctions exist', async () => {
//       const identifier = { userId: 'user123' };
//       cartRepositoryMock.getCart.mockResolvedValue(mockUserCart);
//       itemJunctionRepositoryMock.getManyByRelationshipId.mockResolvedValue([]);

//       const result = await service.getCartWithBundles(identifier);

//       expect(result).toEqual({ ...mockUserCart, bundles: [] });
//       expect(cartRepositoryMock.getCart).toHaveBeenCalledWith(identifier);
//       expect(itemJunctionRepositoryMock.getManyByRelationshipId).toHaveBeenCalledWith('cart', 'cart123');
//     });

//     it('should return cart with bundles when junctions exist', async () => {
//       const identifier = { userId: 'user123' };

//       cartRepositoryMock.getCart.mockResolvedValue(mockUserCart);
//       itemJunctionRepositoryMock.getManyByRelationshipId.mockResolvedValue(mockJunctions);

//       const result = await service.getCartWithBundles(identifier);

//       expect(result).toEqual({
//         ...mockUserCart,
//         bundles: bundlesWithQuantity,
//       });
//       expect(cartRepositoryMock.getCart).toHaveBeenCalledWith(identifier);
//       expect(itemJunctionRepositoryMock.getManyByRelationshipId).toHaveBeenCalledWith('cart', 'cart123');
//     });
//   });

//   describe('mergeGuestCartWithUserCart', () => {
//     it('should create new user cart when no carts exist', async () => {
//       cartRepositoryMock.getUserCart.mockResolvedValue(null);
//       cartRepositoryMock.getGuestCart.mockResolvedValue(null);
//       cartRepositoryMock.createUserCart.mockResolvedValue(mockUserCart);

//       const result = await service.mergeGuestCartWithUserCart({userId: mockUserCart.userId, guestToken: mockGuestCart.guestToken});

//       expect(result).toEqual(mockUserCart);
//       expect(cartRepositoryMock.getUserCart).toHaveBeenCalledWith(mockUserCart.userId);
//       expect(cartRepositoryMock.getGuestCart).toHaveBeenCalledWith(mockGuestCart.guestToken);
//       expect(cartRepositoryMock.createUserCart).toHaveBeenCalledWith(mockUserCart.userId);
//     });

//     it('should return existing user cart when guest cart does not exist', async () => {
//       cartRepositoryMock.getUserCart.mockResolvedValue(mockUserCart);
//       cartRepositoryMock.getGuestCart.mockResolvedValue(null);

//       const result = await service.mergeGuestCartWithUserCart({userId: mockUserCart.userId, guestToken: mockGuestCart.guestToken});

//       expect(result).toEqual(mockUserCart);
//       expect(cartRepositoryMock.getUserCart).toHaveBeenCalledWith(mockUserCart.userId);
//       expect(cartRepositoryMock.getGuestCart).toHaveBeenCalledWith(mockGuestCart.guestToken);
//       expect(cartRepositoryMock.createUserCart).not.toHaveBeenCalled();
//     });

//     it('should convert guest cart to user cart when user cart does not exist', async () => {
//       const updatedCart = {...mockGuestCart, id: 'guestCart123', userId: 'user123', guestToken: '' };
      
//       cartRepositoryMock.getUserCart.mockResolvedValue(null);
//       cartRepositoryMock.getGuestCart.mockResolvedValue(mockGuestCart);
//       cartRepositoryMock.update.mockResolvedValue(updatedCart);

//       const result = await service.mergeGuestCartWithUserCart({userId: mockUserCart.userId, guestToken: mockGuestCart.guestToken});

//       expect(result).toEqual(updatedCart);
//       expect(cartRepositoryMock.getUserCart).toHaveBeenCalledWith(mockUserCart.userId);
//       expect(cartRepositoryMock.getGuestCart).toHaveBeenCalledWith(mockGuestCart.guestToken);
//       expect(cartRepositoryMock.update).toHaveBeenCalledWith(mockGuestCart.id, {
//         userId: mockUserCart.userId,
//         guestToken: undefined
//       });
//     });
//   });

//   describe('updateItemQuantity', () => {
//     it('should not update item quantity when item junction does not exist', async () => {
//       const bundleId = 'bundle123';
//       const quantity = 5;
      
//       itemJunctionRepositoryMock.getOne.mockResolvedValue(null);
      
//       await service.updateItemQuantity({ userId: mockUserCart.id }, { bundleId, quantity });

//       expect(itemJunctionRepositoryMock.getOne).not.toHaveBeenCalled();
//       expect(itemJunctionRepositoryMock.updateQuantity).not.toHaveBeenCalled();
//     });
//   });

//   describe('createGuestCart', () => {
//     it('should create a new guest cart', async () => {
//       const guestToken = 'token123';
      
//       cartRepositoryMock.createGuestCart.mockResolvedValue(mockUserCart);
      
//       const result = await service.createGuestCart(guestToken);

//       expect(result).toEqual(mockUserCart);
//       expect(cartRepositoryMock.createGuestCart).toHaveBeenCalledWith(guestToken);
//     });
//   });

//   describe('createUserCart', () => {
//     it('should create a new user cart', async () => {
//       const userId = 'user123';
      
//       cartRepositoryMock.createUserCart.mockResolvedValue(mockUserCart);
      
//       const result = await service.createUserCart(userId);

//       expect(result).toEqual(mockUserCart);
//       expect(cartRepositoryMock.createUserCart).toHaveBeenCalledWith(userId);
//     });
//   });
// });