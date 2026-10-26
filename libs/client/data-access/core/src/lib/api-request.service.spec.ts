import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_URL, ApiRequestService } from './api-request.service';

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
    jest.restoreAllMocks();
  });

  describe('configuration', () => {
    it('should send credentials and a JSON content type', () => {
      service.get(mockPath).subscribe();

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockResponse);
    });

    it('should target the API url provided by the app', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [{ provide: API_URL, useValue: 'http://localhost:8080/api' }],
      });
      httpMock = TestBed.inject(HttpTestingController);

      TestBed.inject(ApiRequestService).get(mockPath).subscribe();

      httpMock.expectOne(`http://localhost:8080/api${mockPath}`).flush(mockResponse);
    });

    it('should log errors to the console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      service.get(mockPath).subscribe();

      httpMock.expectOne(`${mockUrl}${mockPath}`)
        .flush('Error', { status: 500, statusText: 'Server Error' });

      expect(consoleSpy).toHaveBeenCalled();
    });
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
      let result: unknown = 'not emitted';
      service.get(mockPath).subscribe((response) => result = response);

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
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
      let result: unknown = 'not emitted';
      service.post(mockPath, mockBody).subscribe((response) => result = response);

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
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
      let result: unknown = 'not emitted';
      service.patch(mockPath, mockBody).subscribe((response) => result = response);

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
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
      let result: unknown = 'not emitted';
      service.delete(mockPath).subscribe((response) => result = response);

      const req = httpMock.expectOne(`${mockUrl}${mockPath}`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(result).toBeNull();
    });
  });
});
