import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BundleFormComponent } from '../bundle-form/bundle-form.component';
import { SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { filter, Subscription, of, catchError } from 'rxjs';
import { Bundle, BundleDto, BundleFormValue, BundleService } from '@paris-2024/client-data-access-bundle';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'lib-bundle-values',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    BundleFormComponent, 
    SubmitButtonComponent,
  ],
  templateUrl: './bundle-values.component.html',
  styleUrl: './bundle-values.component.scss',
})
export class BundleValuesComponent implements OnInit, OnDestroy {
  bundle?: Bundle;
  createBundleForm!: FormGroup;
  subscription: Subscription = new Subscription();
  
  constructor(
    protected formBuilder: FormBuilder,
    protected bundleService: BundleService,
    protected router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createBundleForm = this.formBuilder.group({
      bundle: this.formBuilder.group({},
        Validators.required
      ),
    });
    
    const bundleId = this.route.snapshot.paramMap.get('id');
    console.log(bundleId)
    if (bundleId) {
      this.loadBundle(bundleId);
    }
  }

  loadBundle(bundleId: string): void {
    this.subscription.add(
      this.bundleService.findOneById(bundleId)
        .pipe(
          catchError(error => {
            console.error('Error loading bundle:', error);
            this.router.navigate(['admin/bundles/create']);
            return of(null);
          }),
        )
        .subscribe(bundle => {
          if (bundle) {
            this.bundle = bundle;
            setTimeout(() => {
              const bundleFormGroup = this.createBundleForm.get('bundle') as FormGroup;
              if (bundleFormGroup) {
                bundleFormGroup.patchValue({
                  name: this.bundle?.name,
                  price: this.bundle?.price,
                  ticketAmount: this.bundle?.ticketAmount
                });
              }
            });
          }
        })
    );
  }

  onSubmit(): Subscription | Promise<boolean> {
    if (!this.createBundleForm.valid) {
      return this.router.navigate(['admin/bundles/create']);
    }
    
    const bundleDtoValues: BundleFormValue = this.parseBundleForm();
    const bundleDto = new BundleDto(bundleDtoValues as BundleFormValue);
    
    if (this.bundle?.id) {
      return this.updateBundle(bundleDto);
    } else {
      return this.createBundle(bundleDto);
    }
  }
  
  createBundle(bundle: BundleDto): Subscription {
    return this.subscription =
      this.bundleService.create(bundle)
        .pipe(filter(res => !!res))
        .subscribe(() => {
          this.router.navigate(['shop/bundles']);
        });
  }
  
  updateBundle(bundle: BundleDto): Subscription {
    if(!this.bundle) {
      return this.createBundle(bundle);
    }
    
    return this.subscription = 
      this.bundleService.update(bundle, this.bundle.id)
        .pipe(filter(res => !!res))
        .subscribe(() => {
          this.router.navigate(['/admin/bundles/sales']);
        });
  }

  deleteBundle(id: string) {
    return this.subscription = this.bundleService.delete(id).subscribe(() => {
      this.router.navigate(['/admin/bundles/sales'])
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private parseBundleForm(): BundleFormValue {
    const bundleDtoValues: BundleFormValue = {
      name: this.createBundleForm.value.bundle.name,
      price: this.createBundleForm.value.bundle.price,
      ticketAmount: this.createBundleForm.value.bundle.ticketAmount,
    };
    return bundleDtoValues;
  }
}
