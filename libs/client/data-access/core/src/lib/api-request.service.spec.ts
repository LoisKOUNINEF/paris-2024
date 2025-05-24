import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiRequestService } from './api-request.service';

describe('ApiRequestService', () => {
  let service: ApiRequestService;
  let httpMock: HttpTestingController;

  const mockUrl = '/api';
  const mockPath = '/test';
  const mockResponse = { success: true };
  const mockBody = { data: 'test data' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiRequestService],
    });
    service = TestBed.inject(ApiRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('should make a GET request and return the data', () => {
      service.get(mockPath).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle errors', () => {
      service.get(mockPath).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('post', () => {
    it('should make a POST request and return the data', () => {
      service.post(mockPath, mockBody).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(JSON.stringify(mockBody));
      req.flush(mockResponse);
    });

    it('should handle errors', () => {
      service.post(mockPath, mockBody).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('patch', () => {
    it('should make a PATCH request and return the data', () => {
      service.patch(mockPath, mockBody).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBe(JSON.stringify(mockBody));
      req.flush(mockResponse);
    });

    it('should handle errors', () => {
      service.patch(mockPath, mockBody).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('delete', () => {
    it('should make a DELETE request and return the data', () => {
      service.delete(mockPath).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle errors', () => {
      service.delete(mockPath).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
