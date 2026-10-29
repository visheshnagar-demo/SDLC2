import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    component.percentage = 75;
    fixture.detectChanges();
  });

  it('should create and render progress bar width', () => {
    expect(component).toBeTruthy();
    expect(component.clampedPercentage).toBe(75);
    const fillEl = fixture.nativeElement.querySelector('.progress-bar-fill') as HTMLElement;
    expect(fillEl.style.width).toBe('75%');
  });
});
