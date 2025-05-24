import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OriginGuard } from './origin.guard';
import { Request } from 'express';

describe('OriginGuard', () => {
  let guard: OriginGuard;
  let mockContext: ExecutionContext;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    guard = new OriginGuard();
    mockRequest = {
      hostname: '',
      headers: {},
    };
    
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest
      }),
    } as unknown as ExecutionContext;
  });

  describe('canActivate', () => {
    it('should allow access for localhost', () => {
      Object.defineProperty(mockRequest, 'hostname', {
        value: 'localhost',
        configurable: true
      });
      
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access for main domain origin', () => {
      mockRequest.headers = {
        origin: 'https://studi-exam-jo.lois-kouninef.eu/some-path'
      };
      
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access for main domain origin with www. prefix', () => {
      mockRequest.headers = {
        origin: 'https://www.studi-exam-jo.lois-kouninef.eu/some-path'
      };
      
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access for staging domain origin', () => {
      mockRequest.headers = {
        origin: 'https://studi-exam-jo-staging.lois-kouninef.eu/some-path'
      };
      
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access when using referer instead of origin', () => {
      mockRequest.headers = {
        referer: 'https://studi-exam-jo.lois-kouninef.eu/some-path'
      };
      
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should deny access for invalid origin', () => {
      Object.defineProperty(mockRequest, 'hostname', {
        value: 'whatever-site.com',
        configurable: true
      });
      mockRequest.headers = {
        origin: 'https://whatever-site.com'
      };
      
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access when no origin or referer is provided and hostname is not localhost', () => {
      Object.defineProperty(mockRequest, 'hostname', {
        value: 'example.com',
        configurable: true
      });
      mockRequest.headers = {};
      
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access for malformed origin URL', () => {
      mockRequest.headers = {
        origin: 'malformed-url'
      };
      
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access for subdomain spoofing attempts', () => {
      mockRequest.headers = {
        origin: 'https://evil-site.com?fake=lois-kouninef.eu'
      };
      
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access for non-https protocol (except localhost)', () => {
      mockRequest.headers = {
        origin: 'http://studi-exam-jo.lois-kouninef.eu'
      };
      
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should verify that switchToHttp is called', () => {
      Object.defineProperty(mockRequest, 'hostname', {
        value: 'localhost',
        configurable: true
      });
      
      guard.canActivate(mockContext);
      
      expect(mockContext.switchToHttp).toHaveBeenCalled();
    });
  });
});