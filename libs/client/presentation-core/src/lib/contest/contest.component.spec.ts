import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { ContestComponent, Contest } from './contest.component';

describe('ContestComponent', () => {
  let component: ContestComponent;
  let fixture: ComponentFixture<ContestComponent>;

  const mockContest: Contest = {
    name: 'Test Contest',
    date: new Date('2024-03-15'),
    imageUrl: 'test-image.jpg',
    details: 'Test contest details'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestComponent, DatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(ContestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values for contest input', () => {
    expect(component.contest).toBeDefined();
    expect(component.contest.name).toBe('');
    expect(component.contest.details).toBe('');
    expect(component.contest.imageUrl).toBe('');
    expect(component.contest.date instanceof Date).toBeTruthy();
  });

  describe('template rendering', () => {
    beforeEach(() => {
      component.contest = mockContest;
      fixture.detectChanges();
    });

    it('should display contest name', () => {
      const nameElement = fixture.nativeElement.querySelector('p');
      expect(nameElement.textContent.trim()).toBe('Test Contest');
    });

    it('should display contest image with correct src and alt', () => {
      const imageElement: HTMLImageElement = fixture.nativeElement.querySelector('img');
      expect(imageElement.src).toContain('test-image.jpg');
      expect(imageElement.alt).toContain('Test Contest');
    });

    it('should display formatted date', () => {
      const dateElement = fixture.nativeElement.querySelectorAll('p')[1];
      const datePipe = new DatePipe('en-US');
      const expectedDate = datePipe.transform(mockContest.date, 'fullDate');
      expect(dateElement.textContent.trim()).toBe(expectedDate);
    });

    it('should display contest details', () => {
      const detailsElement = fixture.nativeElement.querySelector('.details');
      expect(detailsElement.textContent.trim()).toBe('Test contest details');
    });
  });

  describe('input changes', () => {
    it('should update template when contest input changes', () => {
      const updatedContest: Contest = {
        name: 'Updated Contest',
        date: new Date('2024-04-20'),
        imageUrl: 'updated-image.jpg',
        details: 'Updated details'
      };

      component.contest = updatedContest;
      fixture.detectChanges();

      const nameElement = fixture.nativeElement.querySelector('p');
      const imageElement: HTMLImageElement = fixture.nativeElement.querySelector('img');
      const detailsElement = fixture.nativeElement.querySelector('.details');

      expect(nameElement.textContent.trim()).toBe('Updated Contest');
      expect(imageElement.src).toContain('updated-image.jpg');
      expect(detailsElement.textContent.trim()).toBe('Updated details');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const emptyContest: Contest = {
        name: '',
        date: new Date(),
        imageUrl: '',
        details: ''
      };

      component.contest = emptyContest;
      fixture.detectChanges();

      const nameElement = fixture.nativeElement.querySelector('p');
      const detailsElement = fixture.nativeElement.querySelector('.details');

      expect(nameElement.textContent.trim()).toBe('');
      expect(detailsElement.textContent.trim()).toBe('');
    });
  });
});