import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouteButtonComponent } from './route-button.component';
import { By } from '@angular/platform-browser';

describe('RouteButtonComponent', () => {
  let component: RouteButtonComponent;
  let fixture: ComponentFixture<RouteButtonComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouteButtonComponent],
      providers: [
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    });

    fixture = TestBed.createComponent(RouteButtonComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the correct path when the button is clicked', () => {
    component.path = '/example-path';
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    expect(router.navigate).toHaveBeenCalledWith(['/example-path']);
  });

  it('should emit the buttonClicked event when the button is clicked', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should display the correct content', () => {
    component.content = 'Go to Example Page';
    fixture.detectChanges();

    const buttonText = fixture.debugElement.query(By.css('button')).nativeElement.textContent;
    expect(buttonText).toContain('Go to Example Page');
  });
});
