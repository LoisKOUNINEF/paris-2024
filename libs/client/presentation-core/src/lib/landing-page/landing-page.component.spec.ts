import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { ContestComponent } from '../contest/contest.component';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { CONTESTS } from '../contest/contests';
import { By } from '@angular/platform-browser';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        ContestComponent,
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

  it('should initialize contests with CONTESTS data', () => {
    expect(component.contests).toBe(CONTESTS);
  });

  describe('template rendering', () => {
    it('should render the main title', () => {
      const titleElement = fixture.nativeElement.querySelector('h1');
      expect(titleElement.textContent.trim()).toBe('Les JO c\'est bien.');
    });

    it('should render all contests from the array', () => {
      const contestElements = fixture.nativeElement.querySelectorAll('lib-contest');
      expect(contestElements.length).toBe(CONTESTS.length);
    });

    it('should pass correct contest data to contest components', () => {
      const contestComponents = fixture.debugElement.queryAll(By.directive(ContestComponent));
      contestComponents.forEach((debugElement, index) => {
        const contestComponent = debugElement.componentInstance;
        expect(contestComponent.contest).toEqual(CONTESTS[index]);
      });
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
      const contests = fixture.nativeElement.querySelector('.contests');

      expect(wrapper).toBeTruthy();
      expect(container).toBeTruthy();
      expect(presentation).toBeTruthy();
      expect(contests).toBeTruthy();
    });
  });

  describe('contests section', () => {
    it('should render contests in correct order', () => {
      const contestComponents = fixture.debugElement.queryAll(By.directive(ContestComponent));
      contestComponents.forEach((debugElement, index) => {
        const contestComponent = debugElement.componentInstance;
        expect(contestComponent.contest).toEqual(CONTESTS[index]);
      });
    });

    it('should update contests when array changes', () => {
      const newContests = CONTESTS.slice(0, 2);
      component.contests = newContests;
      fixture.detectChanges();

      const contestElements = fixture.nativeElement.querySelectorAll('lib-contest');
      expect(contestElements.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty contests array', () => {
      component.contests = [];
      fixture.detectChanges();

      const contestElements = fixture.nativeElement.querySelectorAll('lib-contest');
      expect(contestElements.length).toBe(0);
      
      const contestsContainer = fixture.nativeElement.querySelector('.contests');
      expect(contestsContainer).toBeTruthy();
    });

    it('should maintain structure when contests is undefined', () => {
      component.contests = undefined as any;
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.wrapper');
      const container = fixture.nativeElement.querySelector('.container');
      
      expect(wrapper).toBeTruthy();
      expect(container).toBeTruthy();
    });
  });
});