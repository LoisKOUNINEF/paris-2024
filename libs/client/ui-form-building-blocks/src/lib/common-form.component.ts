import { Component } from "@angular/core";
import { ControlContainer, FormBuilder } from "@angular/forms";

@Component({
	template: '',
})
export class CommonFormComponent {
	constructor(
		protected formBuilder: FormBuilder,
		protected controlContainer: ControlContainer
	) {}
}
