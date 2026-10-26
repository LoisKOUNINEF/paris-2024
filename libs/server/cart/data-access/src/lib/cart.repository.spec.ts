import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartRepository } from './cart.repository';
import { Cart } from './cart.entity';
import { UpdateCartDto } from './cart.dto';

describe('CartRepository', () => {
  let cartRepository: CartRepository;

  const mockUserCart = {
    id: '1',
    userId: 'user-123',
    guestToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGuestCart = {
    id: '2',
    userId: null,
    guestToken: '9b2f6c1e-4d3a-4f6b-8c2d-1a2b3c4d5e6f',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartRepository,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockCartRepository,
        },
      ],
    }).compile();

    cartRepository = module.get<CartRepository>(CartRepository);

    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return user cart if there is one', async () => {
      mockCartRepository.findOne.mockResolvedValue(mockUserCart);

      const result = await cartRepository.getCart({userId: mockUserCart.userId});

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserCart.userId },
      });
      expect(result).toEqual(mockUserCart);
    });

    it('should return guest cart if there is no user cart matching identifier', async () => {
      const spyGetUserCart = jest.spyOn(cartRepository as any, 'getUserCart');
      const spyGetGuestCart = jest.spyOn(cartRepository as any, 'getGuestCart');

      mockCartRepository.findOne.mockResolvedValue(null);
      await cartRepository.getCart({userId: mockGuestCart.guestToken});
      expect(spyGetUserCart).toHaveBeenCalledWith(mockGuestCart.guestToken);

      mockCartRepository.findOne.mockResolvedValue(mockGuestCart);
      const result = await cartRepository.getCart({guestToken: mockGuestCart.guestToken});
      expect(spyGetGuestCart).toHaveBeenCalledWith(mockGuestCart.guestToken);

      expect(result).toEqual(mockGuestCart);
    });


    it('should return null when guest cart does not exist', async () => {
      const guestToken = '0f8e7d6c-5b4a-4c3d-9e2f-1a0b9c8d7e6f';
      mockCartRepository.findOne.mockResolvedValue(null);

      const result = await cartRepository['getGuestCart'](guestToken);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { guestToken },
      });
      expect(result).toBeNull();
    });
  });

  describe('createGuestCart', () => {
    it('should create a cart with guestToken', async () => {
      const guestToken = '9b2f6c1e-4d3a-4f6b-8c2d-1a2b3c4d5e6f';
      mockCartRepository.create.mockReturnValue(mockGuestCart);
      mockCartRepository.save.mockResolvedValue(mockGuestCart);

      const result = await cartRepository.createGuestCart(guestToken);

      expect(mockCartRepository.create).toHaveBeenCalledWith({ guestToken });
      expect(mockCartRepository.save).toHaveBeenCalledWith(mockGuestCart);
      expect(result).toEqual(mockGuestCart);
    });
  });

  describe('createGuestCart with an invalid token', () => {
    it('should refuse a guest token that is not a uuid', async () => {
      await expect(cartRepository.createGuestCart('not-a-uuid')).rejects.toThrow(BadRequestException);
      expect(mockCartRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('createUserCart', () => {
    it('should create a cart with userId', async () => {
      const userId = 'user-123';
      mockCartRepository.create.mockReturnValue(mockUserCart);
      mockCartRepository.save.mockResolvedValue(mockUserCart);

      const result = await cartRepository.createUserCart(userId);

      expect(mockCartRepository.create).toHaveBeenCalledWith({ userId });
      expect(mockCartRepository.save).toHaveBeenCalledWith(mockUserCart);
      expect(result).toEqual(mockUserCart);
    });
  });

  describe('getGuestCart', () => {
    it.each([undefined, '', 'not-a-uuid'])('should not query when guest token is %p', async (guestToken) => {
      const result = await cartRepository.getGuestCart(guestToken as unknown as string);

      expect(result).toBeNull();
      expect(mockCartRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return guest cart when it exists', async () => {
      const guestToken = '9b2f6c1e-4d3a-4f6b-8c2d-1a2b3c4d5e6f';
      mockCartRepository.findOne.mockResolvedValue(mockGuestCart);

      const result = await cartRepository['getGuestCart'](guestToken);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { guestToken },
      });
      expect(result).toEqual(mockGuestCart);
    });
  });

  describe('getUserCart', () => {
    it('should return user cart when it exists', async () => {
      const userId = 'user-123';
      mockCartRepository.findOne.mockResolvedValue(mockUserCart);

      const result = await cartRepository['getUserCart'](userId);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockUserCart);
    });

    it('should return null when user cart does not exist', async () => {
      const userId = 'non-existent-user';
      mockCartRepository.findOne.mockResolvedValue(null);

      const result = await cartRepository['getUserCart'](userId);
      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockCartRepository.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getCartById', () => {
    it('should return cart when it exists', async () => {
      const cartId = '1';
      mockCartRepository.findOne.mockResolvedValue(mockUserCart);

      const result = await cartRepository.getCartById(cartId);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { id: cartId },
      });
      expect(result).toEqual(mockUserCart);
    });

    it('should return null when cart does not exist', async () => {
      const cartId = 'non-existent-id';
      mockCartRepository.findOne.mockResolvedValue(null);

      const result = await cartRepository.getCartById(cartId);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { id: cartId },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update cart when it exists', async () => {
      const cartId = '1';
      const updateCartDto: UpdateCartDto = { 
        userId: 'updated-user-id' 
      };
      
      const existingCart = { ...mockUserCart };
      const updatedCart = { ...mockUserCart, userId: 'updated-user-id' };
      
      mockCartRepository.findOne.mockResolvedValue(existingCart);
      mockCartRepository.save.mockResolvedValue(updatedCart);

      const result = await cartRepository.update(cartId, updateCartDto);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { id: cartId },
      });
      expect(mockCartRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingCart,
          ...updateCartDto,
        })
      );
      expect(result).toEqual(expect.objectContaining({
        ...existingCart,
        ...updateCartDto,
      }));
    });

    it('should return null when cart does not exist', async () => {
      const cartId = 'non-existent-id';
      const updateCartDto: UpdateCartDto = { 
        userId: 'updated-user-id' 
      };
      
      mockCartRepository.findOne.mockResolvedValue(null);

      const result = await cartRepository.update(cartId, updateCartDto);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { id: cartId },
      });
      expect(mockCartRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});