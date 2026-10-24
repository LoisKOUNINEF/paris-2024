import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartRepository } from '@paris-2024/server-data-access-cart';
import { ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const mockCartRepository = {
    getCart: jest.fn(),
    getUserCart: jest.fn(),
    getGuestCart: jest.fn(),
    createUserCart: jest.fn(),
    createGuestCart: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockItemJunctionRepository = {
    getManyByRelationshipId: jest.fn(),
    mergeJunctions: jest.fn(),
    create: jest.fn(),
    getOne: jest.fn(),
    remove: jest.fn(),
    updateQuantity: jest.fn(),
  };

  const userCart = { id: 'user-cart', userId: 'user-1', guestToken: null };
  const guestCart = { id: 'guest-cart', userId: null, guestToken: 'guest-token' };
  const identifiers = { userId: 'user-1', guestToken: 'guest-token' };

  const junction: IItemJunctionModel = {
    junction: 'junction-1', id: 'bundle-1', name: 'Solo', amount: 1, price: 50, quantity: 2,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: ItemJunctionRepository, useValue: mockItemJunctionRepository },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('getCartWithBundles', () => {
    it('should return null if there is no cart', async () => {
      mockCartRepository.getCart.mockResolvedValue(null);

      await expect(service.getCartWithBundles({ userId: 'user-1' })).resolves.toBeNull();
      expect(mockItemJunctionRepository.getManyByRelationshipId).not.toHaveBeenCalled();
    });

    it('should return cart with its bundles', async () => {
      mockCartRepository.getCart.mockResolvedValue(userCart);
      mockItemJunctionRepository.getManyByRelationshipId.mockResolvedValue([junction]);

      await expect(service.getCartWithBundles({ userId: 'user-1' })).resolves.toEqual({
        ...userCart,
        bundles: [junction],
      });
      expect(mockItemJunctionRepository.getManyByRelationshipId).toHaveBeenCalledWith('cart', 'user-cart');
    });

    it('should return empty bundles for an empty cart', async () => {
      mockCartRepository.getCart.mockResolvedValue(userCart);
      mockItemJunctionRepository.getManyByRelationshipId.mockResolvedValue([]);

      await expect(service.getCartWithBundles({ userId: 'user-1' })).resolves.toEqual({
        ...userCart,
        bundles: [],
      });
    });
  });

  describe('mergeGuestCartWithUserCart', () => {
    it.each([
      ['undefined', undefined],
      ['empty', ''],
    ])('should not look up a guest cart when guest token is %s', async (_case, guestToken) => {
      mockCartRepository.getUserCart.mockResolvedValue(userCart);

      const result = await service.mergeGuestCartWithUserCart({
        userId: 'user-1',
        guestToken: guestToken as unknown as string,
      });

      expect(result).toBe(userCart);
      expect(mockCartRepository.getGuestCart).not.toHaveBeenCalled();
      expect(mockCartRepository.update).not.toHaveBeenCalled();
      expect(mockCartRepository.delete).not.toHaveBeenCalled();
    });

    it('should return existing user cart when there is no guest cart', async () => {
      mockCartRepository.getUserCart.mockResolvedValue(userCart);
      mockCartRepository.getGuestCart.mockResolvedValue(null);

      await expect(service.mergeGuestCartWithUserCart(identifiers)).resolves.toBe(userCart);
      expect(mockCartRepository.createUserCart).not.toHaveBeenCalled();
    });

    it('should create user cart when user has no cart and there is no guest cart', async () => {
      mockCartRepository.getUserCart.mockResolvedValue(null);
      mockCartRepository.getGuestCart.mockResolvedValue(null);
      mockCartRepository.createUserCart.mockResolvedValue(userCart);

      await expect(service.mergeGuestCartWithUserCart(identifiers)).resolves.toBe(userCart);
      expect(mockCartRepository.createUserCart).toHaveBeenCalledWith('user-1');
    });

    it('should hand guest cart over to user when user has no cart', async () => {
      const handedOver = { ...guestCart, userId: 'user-1', guestToken: null };
      mockCartRepository.getUserCart.mockResolvedValue(null);
      mockCartRepository.getGuestCart.mockResolvedValue(guestCart);
      mockCartRepository.update.mockResolvedValue(handedOver);

      await expect(service.mergeGuestCartWithUserCart(identifiers)).resolves.toBe(handedOver);
      expect(mockCartRepository.update).toHaveBeenCalledWith('guest-cart', {
        userId: 'user-1',
        guestToken: null,
      });
      expect(mockItemJunctionRepository.mergeJunctions).not.toHaveBeenCalled();
      expect(mockCartRepository.delete).not.toHaveBeenCalled();
    });

    it('should merge guest items into user cart and delete guest cart', async () => {
      const guestJunctions = [junction];
      const userJunctions = [{ ...junction, junction: 'junction-2', quantity: 1 }];
      mockCartRepository.getUserCart.mockResolvedValue(userCart);
      mockCartRepository.getGuestCart.mockResolvedValue(guestCart);
      mockItemJunctionRepository.getManyByRelationshipId
        .mockResolvedValueOnce(guestJunctions)
        .mockResolvedValueOnce(userJunctions);

      await expect(service.mergeGuestCartWithUserCart(identifiers)).resolves.toBe(userCart);

      expect(mockItemJunctionRepository.getManyByRelationshipId).toHaveBeenNthCalledWith(1, 'cart', 'guest-cart');
      expect(mockItemJunctionRepository.getManyByRelationshipId).toHaveBeenNthCalledWith(2, 'cart', 'user-cart');
      expect(mockItemJunctionRepository.mergeJunctions).toHaveBeenCalledWith('user-cart', guestJunctions, userJunctions);
      expect(mockCartRepository.delete).toHaveBeenCalledWith('guest-cart');
    });

    it('should delete guest cart only after items are merged', async () => {
      mockCartRepository.getUserCart.mockResolvedValue(userCart);
      mockCartRepository.getGuestCart.mockResolvedValue(guestCart);
      mockItemJunctionRepository.getManyByRelationshipId.mockResolvedValue([]);
      mockItemJunctionRepository.mergeJunctions.mockRejectedValue(new Error('db failure'));

      await expect(service.mergeGuestCartWithUserCart(identifiers)).rejects.toThrow('db failure');
      expect(mockCartRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('addToCart', () => {
    const dto = { bundleId: 'bundle-1', quantity: 2 };

    it('should add item to existing cart', async () => {
      mockCartRepository.getCart.mockResolvedValue(userCart);

      await service.addToCart({ userId: 'user-1' }, dto);

      expect(mockItemJunctionRepository.create).toHaveBeenCalledWith({ ...dto, cartId: 'user-cart' });
      expect(mockCartRepository.createUserCart).not.toHaveBeenCalled();
    });

    it('should create user cart if user has none', async () => {
      mockCartRepository.getCart.mockResolvedValue(null);
      mockCartRepository.createUserCart.mockResolvedValue(userCart);

      await service.addToCart({ userId: 'user-1' }, dto);

      expect(mockCartRepository.createUserCart).toHaveBeenCalledWith('user-1');
      expect(mockItemJunctionRepository.create).toHaveBeenCalledWith({ ...dto, cartId: 'user-cart' });
    });

    it('should create guest cart if guest has none', async () => {
      mockCartRepository.getCart.mockResolvedValue(null);
      mockCartRepository.createGuestCart.mockResolvedValue(guestCart);

      await service.addToCart({ guestToken: 'guest-token' }, dto);

      expect(mockCartRepository.createGuestCart).toHaveBeenCalledWith('guest-token');
      expect(mockItemJunctionRepository.create).toHaveBeenCalledWith({ ...dto, cartId: 'guest-cart' });
    });

    it('should ignore cartId sent by client', async () => {
      mockCartRepository.getCart.mockResolvedValue(userCart);

      await service.addToCart({ userId: 'user-1' }, { ...dto, cartId: 'someone-else-cart' });

      expect(mockItemJunctionRepository.create).toHaveBeenCalledWith({ ...dto, cartId: 'user-cart' });
    });

    it('should throw without identifier', async () => {
      mockCartRepository.getCart.mockResolvedValue(null);

      await expect(service.addToCart({}, dto)).rejects.toThrow(BadRequestException);
      expect(mockItemJunctionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('removeFromCart', () => {
    it('should remove item junction from cart', async () => {
      mockItemJunctionRepository.getOne.mockResolvedValue({ id: 'junction-1' });

      await service.removeFromCart('user-cart', 'bundle-1');

      expect(mockItemJunctionRepository.getOne).toHaveBeenCalledWith('user-cart', 'bundle-1');
      expect(mockItemJunctionRepository.remove).toHaveBeenCalledWith('junction-1');
    });

    it('should return null if item is not in cart', async () => {
      mockItemJunctionRepository.getOne.mockResolvedValue(null);

      await expect(service.removeFromCart('user-cart', 'bundle-1')).resolves.toBeNull();
      expect(mockItemJunctionRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('updateItemQuantity', () => {
    const dto = { bundleId: 'bundle-1', quantity: 5 };

    it('should update quantity of item in the identified cart', async () => {
      mockCartRepository.getCart.mockResolvedValue(guestCart);
      mockItemJunctionRepository.getOne.mockResolvedValue({ id: 'junction-1' });

      await service.updateItemQuantity({ guestToken: 'guest-token' }, dto);

      expect(mockItemJunctionRepository.getOne).toHaveBeenCalledWith('guest-cart', 'bundle-1');
      expect(mockItemJunctionRepository.updateQuantity).toHaveBeenCalledWith('junction-1', 5);
    });

    it('should return null if there is no cart', async () => {
      mockCartRepository.getCart.mockResolvedValue(null);

      await expect(service.updateItemQuantity({ guestToken: 'guest-token' }, dto)).resolves.toBeNull();
      expect(mockItemJunctionRepository.getOne).not.toHaveBeenCalled();
    });

    it('should return null if item is not in cart', async () => {
      mockCartRepository.getCart.mockResolvedValue(guestCart);
      mockItemJunctionRepository.getOne.mockResolvedValue(null);

      await expect(service.updateItemQuantity({ guestToken: 'guest-token' }, dto)).resolves.toBeNull();
      expect(mockItemJunctionRepository.updateQuantity).not.toHaveBeenCalled();
    });
  });
});
