import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OlympicRingsComponent } from './olympic-rings.component';

describe('OlympicRingsComponent', () => {
  let component: OlympicRingsComponent;
  let fixture: ComponentFixture<OlympicRingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OlympicRingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OlympicRingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
