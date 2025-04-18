import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ILandingSection, LandingSectionComponent } from './landing-section.component';
import { DatePipe } from '@angular/common';

describe('LandingSectionComponent', () => {
  let component: LandingSectionComponent;
  let fixture: ComponentFixture<LandingSectionComponent>;

  const mockSection: ILandingSection = {
    title: 'Mock section',
    imageUrl: 'test-image.avif',
    imageAlt: 'Mock image',
    content: 'Mock content',
  };

  const mockContest: ILandingSection = {
    title: 'Mock section',
    imageUrl: 'test-image.avif',
    imageAlt: 'Mock image',
    content: 'Mock content',
    date: new Date('2024-03-15'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingSectionComponent, 
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingSectionComponent);
    component = fixture.componentInstance;
    component.section = mockSection;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should display section title', () => {
      const titleElement = fixture.nativeElement.querySelector('h3');
      expect(titleElement.textContent.trim()).toBe('Mock section');
    });

    it('should display section image with correct src and alt', () => {
      const imageElement: HTMLImageElement = fixture.nativeElement.querySelector('img');
      expect(imageElement.src).toContain('test-image.avif');
      expect(imageElement.alt).toContain('Mock image');
    });

    it('should not display date if there is none', () => {
      const dateElement = fixture.nativeElement.querySelector('.section-date');
      expect(dateElement).toBeNull();
    });

    it('should display formatted date', () => {
      component.section = mockContest;
      fixture.detectChanges();

      const dateElement = fixture.nativeElement.querySelector('.section-date');
      const datePipe = new DatePipe('en-US');
      const expectedDate = datePipe.transform(mockContest.date, 'fullDate');
      expect(dateElement.textContent.trim()).toBe(expectedDate);
    });

    it('should display section content', () => {
      const detailsElement = fixture.nativeElement.querySelector('.section-content');
      expect(detailsElement.textContent.trim()).toBe('Mock content');
    });
  });

  describe('input changes', () => {
    it('should update template when section input changes', () => {
      const updatedSection: ILandingSection = {
        title: 'Updated Section',
        imageUrl: 'updated-image.avix',
        imageAlt: 'Updated alt',
        content: 'Updated content'
      };

      component.section = updatedSection;
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('h3');
      const imageElement: HTMLImageElement = fixture.nativeElement.querySelector('img');
      const contentElement = fixture.nativeElement.querySelector('.section-content');

      expect(titleElement.textContent.trim()).toBe('Updated Section');
      expect(imageElement.src).toContain('updated-image.avix');
      expect(contentElement.textContent.trim()).toBe('Updated content');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const missingSectionFields: ILandingSection = {
        title: 'Mock Section',
        imageUrl: '',
        content: '',
      };

      component.section = missingSectionFields;
      fixture.detectChanges();

      const detailsElement = fixture.nativeElement.querySelector('.section-content');
      const imageElement: HTMLImageElement = fixture.nativeElement.querySelector('img');

      expect(detailsElement.textContent.trim()).toBe('Pas de description disponible');
      expect(imageElement.src).toContain('assets/images/rings.avif');
      expect(imageElement.alt).toContain('Anneaux olympiques sur une place parisienne');
    });
  });
});
