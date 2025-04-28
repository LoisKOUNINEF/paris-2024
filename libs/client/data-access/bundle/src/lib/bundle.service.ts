import { Injectable } from '@angular/core';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { BundleDto } from './bundle.dto';
import { Observable } from 'rxjs';
import { Bundle } from './bundle.model';
import { IBundleSales } from '@paris-2024/shared-interfaces';

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  private readonly bundlesUrl = '/bundles';

  constructor(private apiRequestService: ApiRequestService) { }

  findAll(): Observable<Array<Bundle>> {
    return this.apiRequestService.get<Array<Bundle>>(this.bundlesUrl);
  }

  findOneByName(bundleName: string): Observable<Bundle> {
    return this.apiRequestService.get<Bundle>(`${this.bundlesUrl}?name=${bundleName}`)
  }

  findOneById(bundleId: Bundle['id']): Observable<Bundle> {
    return this.apiRequestService.get<Bundle>(`${this.bundlesUrl}/${bundleId}`);
  }

  create(bundleDto: BundleDto): Observable<Bundle> {
    return this.apiRequestService.post<Bundle>(`${this.bundlesUrl}`, bundleDto);
  }

  update(bundleDto: BundleDto, bundleId: Bundle['id']): Observable<Bundle> {
    return this.apiRequestService.patch<Bundle>(`${this.bundlesUrl}/${bundleId}`, bundleDto);
  }

  delete(bundleId: Bundle['id']): Observable<any> {
    return this.apiRequestService.delete<Bundle>(`${this.bundlesUrl}/${bundleId}`);
  }

  getWithSales(): Observable<Array<IBundleSales>> {
    return this.apiRequestService.get<Array<IBundleSales>>(`${this.bundlesUrl}/sales`);
  }
}
