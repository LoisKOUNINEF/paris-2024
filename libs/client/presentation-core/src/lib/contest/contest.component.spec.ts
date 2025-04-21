import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { ContestComponent } from './contest.component';
import { IContest } from './contests';

describe('ContestComponent', () => {
  let component: ContestComponent;
  let fixture: ComponentFixture<ContestComponent>;

  const mockContest: IContest = {
    name: 'Test Contest',
    date: new Date('2024-03-15'),
    imageUrl: 'test-image.jpg',
    details: 'Test contest details',
    isParalympic: true,
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
      const updatedContest: IContest = {
        name: 'Updated Contest',
        date: new Date('2024-04-20'),
        imageUrl: 'updated-image.jpg',
        details: 'Updated details',
        isParalympic: false,
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
      const emptyContest: IContest = {
        name: '',
        date: new Date(),
        imageUrl: '',
        details: '',
        isParalympic: true,
      };

      component.contest = emptyContest;
      fixture.detectChanges();

      const nameElement = fixture.nativeElement.querySelector('p');
      const detailsElement = fixture.nativeElement.querySelector('.details');

      expect(nameElement.textContent.trim()).toBe('');
      expect(detailsElement.textContent.trim()).toBe('Pas de description disponible');
    });
  });
});




  //   it('should render all contests from the array', () => {
  //     const contestElements = fixture.nativeElement.querySelectorAll('lib-contest');
  //     expect(contestElements.length).toBe(CONTESTS.length);
  //   });

  // it('should initialize contests with CONTESTS data', () => {
  //   expect(component.contests).toBe(CONTESTS);
  // });

  //   it('should pass correct contest data to contest components', () => {
  //     const contestComponents = fixture.debugElement.queryAll(By.directive(ContestComponent));
  //     contestComponents.forEach((debugElement, index) => {
  //       const contestComponent = debugElement.componentInstance;
  //       expect(contestComponent.contest).toEqual(CONTESTS[index]);
  //     });
  //   });

// describe('contests section', () => {
//     it('should render contests in correct order', () => {
//       const contestComponents = fixture.debugElement.queryAll(By.directive(ContestComponent));
//       contestComponents.forEach((debugElement, index) => {
//         const contestComponent = debugElement.componentInstance;
//         expect(contestComponent.contest).toEqual(CONTESTS[index]);
//       });
//     });

//     it('should update contests when array changes', () => {
//       const newContests = CONTESTS.slice(0, 2);
//       component.contests = newContests;
//       fixture.detectChanges();

//       const contestElements = fixture.nativeElement.querySelectorAll('lib-contest');
//       expect(contestElements.length).toBe(2);
//     });
//   });

//   describe('edge cases', () => {
//     it('should handle empty contests array', () => {
//       component.contests = [];
//       fixture.detectChanges();

//       const contestElements = fixture.nativeElement.querySelectorAll('lib-contest');
//       expect(contestElements.length).toBe(0);
      
//       const contestsContainer = fixture.nativeElement.querySelector('.contests');
//       expect(contestsContainer).toBeTruthy();
//     });

//     it('should maintain structure when contests is undefined', () => {
//       component.contests = undefined as any;
//       fixture.detectChanges();

//       const wrapper = fixture.nativeElement.querySelector('.wrapper');
//       const container = fixture.nativeElement.querySelector('.container');
      
//       expect(wrapper).toBeTruthy();
//       expect(container).toBeTruthy();
//     });
//   });