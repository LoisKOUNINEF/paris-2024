import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButtonComponent', () => {
  let component: SubmitButtonComponent;
  let fixture: ComponentFixture<SubmitButtonComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitButtonComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default content "Valider"', () => {
    fixture.detectChanges();
    expect(compiled.querySelector('button')?.textContent).toBe('💻 Valider');
  });

  it('should render the custom content when provided', () => {
    component.content = 'Submit';
    fixture.detectChanges();
    expect(compiled.querySelector('button')?.textContent).toBe('💻 Submit');
  });

  it('should be enabled by default', () => {
    fixture.detectChanges();
    expect(compiled.querySelector('button')?.hasAttribute('disabled')).toBe(false);
  });

  it('should be disabled when isDisabled is true', () => {
    component.isDisabled = true;
    fixture.detectChanges();
    expect(compiled.querySelector('button')?.hasAttribute('disabled')).toBe(true);
  });

  it('should be enabled when isDisabled is false', () => {
    component.isDisabled = false;
    fixture.detectChanges();
    expect(compiled.querySelector('button')?.hasAttribute('disabled')).toBe(false);
  });
});
