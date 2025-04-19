import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemJunctionRepository } from './item-junction.repository';
import { ItemJunction } from './item-junction.entity';
import { ItemJunctionDto } from './item-junction.dto';
import { createEntityMock } from '@paris-2024/shared-mocks';

const { mockEntity } = createEntityMock(ItemJunction);
const mockItemJunction: ItemJunction = {
  ...mockEntity,
  id: 'itemJunction-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  quantity: 2,
  subTotal: 150,
  bundleId: 'bundle-id',
  cartId: '',
  orderId: '',
  deletedAt: null,
};

describe('ItemJunctionRepository', () => {
  let itemJunctionRepository: ItemJunctionRepository;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemJunctionRepository,
        {
          provide: getRepositoryToken(ItemJunction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    itemJunctionRepository = module.get<ItemJunctionRepository>(ItemJunctionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(itemJunctionRepository).toBeDefined();
  });

  describe('getManyByCartId', () => {
    it('should return all matching provided cartId', async () => {
      const mockJunctions = [
        mockItemJunction,
        {...mockItemJunction, id: 'toBeFound'},
        {...mockItemJunction, id: 'notToBeFound', cartId: 'another-id'}
      ];
      mockRepository.find.mockResolvedValue(mockJunctions);

      const result = await itemJunctionRepository.getManyByCartId(mockItemJunction.cartId)

      expect(mockRepository.find).toHaveBeenCalledWith({where: { cartId: mockItemJunction.cartId }});
      expect(result).toEqual(mockJunctions);
    });
  });

  describe('create', () => {
    it('should create and save a new item junction', async () => {
      const dto: ItemJunctionDto = {
        quantity: 2,
        subTotal: 100,
        bundleId: 'bundle-123',
        cartId: 'cart-123',
      };
      
      const itemJunction = { id: 'item-junction-123', ...dto };
      mockRepository.create.mockReturnValue(itemJunction);
      mockRepository.save.mockResolvedValue(itemJunction);

      const result = await itemJunctionRepository.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(itemJunction);
      expect(result).toEqual(itemJunction);
    });
  });

  describe('update', () => {
    it('should update an existing item junction', async () => {
      const dto: ItemJunctionDto = {
        quantity: 3,
        subTotal: 150,
        bundleId: 'bundle-123',
        cartId: 'cart-456',
      };
      
      const updatedItemJunction = { ...mockItemJunction, ...dto };
      
      mockRepository.findOne.mockResolvedValue(mockItemJunction);
      mockRepository.save.mockResolvedValue(updatedItemJunction);

      const result = await itemJunctionRepository.update(mockItemJunction.id, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockItemJunction.id } });
      expect(mockRepository.save).toHaveBeenCalledWith(Object.assign(mockItemJunction, dto));
      expect(result).toEqual(updatedItemJunction);
    });

    it('should return null if item junction not found', async () => {
      const id = 'non-existent-id';
      const dto: ItemJunctionDto = {
        quantity: 3,
        subTotal: 150,
        bundleId: 'bundle-123',
      };
      
      mockRepository.findOne.mockResolvedValue(null);

      const result = await itemJunctionRepository.update(id, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove an existing item junction', async () => {    
      const deleteResult = { affected: 1, raw: {} };
      
      mockRepository.findOne.mockResolvedValue(mockItemJunction);
      mockRepository.delete.mockResolvedValue(deleteResult);

      const result = await itemJunctionRepository.remove(mockItemJunction.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockItemJunction.id } });
      expect(mockRepository.delete).toHaveBeenCalledWith(mockItemJunction.id);
      expect(result).toEqual(deleteResult);
    });

    it('should return null if item junction not found', async () => {
      const id = 'wrongId';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await itemJunctionRepository.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
