import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordResetRepository } from './password-reset.repository';
import { PasswordReset } from './password-reset.entity';

describe('PasswordResetRepository', () => {
  let service: PasswordResetRepository;

  const mockPasswordResetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetRepository,
        {
          provide: getRepositoryToken(PasswordReset),
          useValue: mockPasswordResetRepository,
        },
      ],
    }).compile();

    service = module.get<PasswordResetRepository>(PasswordResetRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a new password reset entity', async () => {
      const email = 'test@example.com';
      const mockPasswordReset = {
        id: 'uuid-123',
        email,
        createdAt: new Date(),
      } as PasswordReset;

      mockPasswordResetRepository.create.mockReturnValue(mockPasswordReset);
      mockPasswordResetRepository.save.mockResolvedValue(mockPasswordReset);

      const result = await service.create(email);

      expect(mockPasswordResetRepository.create).toHaveBeenCalledWith({ email });
      expect(mockPasswordResetRepository.save).toHaveBeenCalledWith(mockPasswordReset);
      expect(result).toEqual(mockPasswordReset);
    });

    it('should throw an error if save fails', async () => {
      const email = 'test@example.com';
      const mockPasswordReset = { email } as PasswordReset;
      const error = new Error('Database error');

      mockPasswordResetRepository.create.mockReturnValue(mockPasswordReset);
      mockPasswordResetRepository.save.mockRejectedValue(error);

      await expect(service.create(email)).rejects.toThrow(error);
      expect(mockPasswordResetRepository.create).toHaveBeenCalledWith({ email });
      expect(mockPasswordResetRepository.save).toHaveBeenCalledWith(mockPasswordReset);
    });
  });

  describe('findOne', () => {
    it('should return a password reset entity when found', async () => {
      const id = 'uuid-123';
      const mockPasswordReset = {
        id,
        email: 'test@example.com',
        createdAt: new Date(),
      } as PasswordReset;

      mockPasswordResetRepository.findOne.mockResolvedValue(mockPasswordReset);

      const result = await service.findOne(id);

      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockPasswordReset);
    });

    it('should return null when entity is not found', async () => {
      const id = 'non-existent-id';

      mockPasswordResetRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('should return a password reset entity when found by email', async () => {
      const email = 'test@example.com';
      const mockPasswordReset = {
        id: 'uuid-123',
        email,
        createdAt: new Date(),
      } as PasswordReset;

      mockPasswordResetRepository.findOneBy.mockResolvedValue(mockPasswordReset);

      const result = await service.findOneByEmail(email);

      expect(mockPasswordResetRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockPasswordReset);
    });

    it('should return null when no entity is found by email', async () => {
      const email = 'nonexistent@example.com';

      mockPasswordResetRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOneByEmail(email);

      expect(mockPasswordResetRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a password reset entity when found', async () => {
      const id = 'uuid-123';
      const mockPasswordReset = {
        id,
        email: 'test@example.com',
        createdAt: new Date(),
      } as PasswordReset;

      mockPasswordResetRepository.findOne.mockResolvedValue(mockPasswordReset);
      mockPasswordResetRepository.remove.mockResolvedValue(mockPasswordReset);

      const result = await service.remove(id);

      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockPasswordResetRepository.remove).toHaveBeenCalledWith(mockPasswordReset);
      expect(result).toEqual(mockPasswordReset);
    });

    it('should return undefined when entity to remove is not found', async () => {
      const id = 'non-existent-id';

      mockPasswordResetRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(id);

      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockPasswordResetRepository.remove).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should throw an error if remove operation fails', async () => {
      const id = 'uuid-123';
      const mockPasswordReset = {
        id,
        email: 'test@example.com',
        createdAt: new Date(),
      } as PasswordReset;
      const error = new Error('Database error');

      mockPasswordResetRepository.findOne.mockResolvedValue(mockPasswordReset);
      mockPasswordResetRepository.remove.mockRejectedValue(error);

      await expect(service.remove(id)).rejects.toThrow(error);
      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockPasswordResetRepository.remove).toHaveBeenCalledWith(mockPasswordReset);
    });
  });
});
