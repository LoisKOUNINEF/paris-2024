import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BundleFormComponent } from '../bundle-form/bundle-form.component';
import { SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { filter, Subscription } from 'rxjs';
import { BundleDto, BundleFormValue, BundleService } from '@paris-2024/client-data-access-bundle';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-bundle-create',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    BundleFormComponent, 
    SubmitButtonComponent,
  ],
  templateUrl: './bundle-create.component.html',
  styleUrl: './bundle-create.component.scss',
})
export class BundleCreateComponent implements OnInit, OnDestroy {
  createBundleForm!: FormGroup;
  createSubscription: Subscription = new Subscription;

  constructor(
    protected formBuilder: FormBuilder,
    protected bundleService: BundleService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.createBundleForm = this.formBuilder.group({
      bundle: this.formBuilder.group({},
        Validators.required
      ),
    })
  }

  createBundle(): Subscription | Promise<boolean> {
    if(!this.createBundleForm.valid) {
      return this.router.navigate(['admin/bundles/create']);
    }
    const bundleDtoValues: BundleFormValue = this.parseBundleForm();
    const bundle = new BundleDto(bundleDtoValues as BundleFormValue);

    return this.createSubscription = this.bundleService.create(bundle)
      .pipe(filter( res => !!res))
      .subscribe(() => {
        this.router.navigate(['shop/bundles'])
      }
    )
  }

  ngOnDestroy(): void {
    if(this.createSubscription) this.createSubscription.unsubscribe();
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

