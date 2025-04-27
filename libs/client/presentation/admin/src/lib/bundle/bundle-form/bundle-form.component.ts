import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonFormComponent } from '@paris-2024/client-ui-form-building-blocks';
import { Bundle } from '@paris-2024/client-data-access-bundle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-bundle-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule,
  ],
  templateUrl: './bundle-form.component.html',
  styleUrl: './bundle-form.component.scss',
})
export class BundleFormComponent extends CommonFormComponent implements OnInit {
  bundleForm!: FormGroup;

  ngOnInit(): void {
    this.bundleForm = this.controlContainer.control as FormGroup;
    this.bundleForm.addControl<Bundle['name']>('name',
      this.formBuilder.control<Bundle['name']>('',
        Validators.required,
      )
    )
    this.bundleForm.addControl('price',
      this.formBuilder.control<Bundle['price']>(0, [
        Validators.required, 
        Validators.pattern("^[0-9]*$"),
        Validators.min(1)
        ],
      )
    )
    this.bundleForm.addControl('ticketAmount',
      this.formBuilder.control<Bundle['ticketAmount']>(0, [
        Validators.required, 
        Validators.pattern("^[0-9]*$"),
        Validators.min(1)
        ],
      )
    )
  }
}