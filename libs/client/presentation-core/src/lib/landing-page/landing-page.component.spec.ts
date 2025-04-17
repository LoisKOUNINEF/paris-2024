import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { LandingSectionComponent } from './landing-section/landing-section.component';
import { By } from '@angular/platform-browser';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        LandingSectionComponent,
        RouteButtonComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render the main title', () => {
      const titleElement = fixture.nativeElement.querySelector('h1');
      expect(titleElement.textContent.trim()).toBe('Jeux Olympiques de Paris 2024');
    });

    it('should render shop route button with correct properties', () => {
      const routeButton = fixture.nativeElement.querySelector('lib-route-button');
      expect(routeButton.getAttribute('content')).toBe('Aller à la boutique');
      expect(routeButton.getAttribute('path')).toBe('shop/offers');
    });

    it('should maintain correct structure with wrapper and container', () => {
      const wrapper = fixture.nativeElement.querySelector('.wrapper');
      const container = fixture.nativeElement.querySelector('.container');
      const presentation = fixture.nativeElement.querySelector('.presentation');

      expect(wrapper).toBeTruthy();
      expect(container).toBeTruthy();
      expect(presentation).toBeTruthy();
    });
    it('should render all sections from the array', () => {
      const sectionElements = fixture.nativeElement.querySelectorAll('lib-landing-section');
      expect(sectionElements.length).toBe(3);
    });

    it('should pass correct section data to section components', () => {
      const sectionComponents = fixture.debugElement.queryAll(By.directive(LandingSectionComponent));
      sectionComponents.forEach((debugElement, index) => {
        const sectionComponent = debugElement.componentInstance;
        expect(sectionComponent.section).toEqual(component.sections[index]);
      });
    });
  });
});