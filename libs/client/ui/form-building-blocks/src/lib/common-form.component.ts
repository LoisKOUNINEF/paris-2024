import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ControlContainer, FormBuilder } from "@angular/forms";

@Component({
	template: '',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class CommonFormComponent {
	constructor(
		protected formBuilder: FormBuilder,
		protected controlContainer: ControlContainer
	) {}
}
