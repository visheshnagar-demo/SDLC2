import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadinessScoreComponent } from './readiness-score.component';

describe('ReadinessScoreComponent', () => {
  let component: ReadinessScoreComponent;
  let fixture: ComponentFixture<ReadinessScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadinessScoreComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadinessScoreComponent);
    component = fixture.componentInstance;
    component.score = 92;
    fixture.detectChanges();
  });

  it('should create and calculate grade and colors', () => {
    expect(component).toBeTruthy();
    expect(component.clampedScore).toBe(92);
    expect(component.grade).toBe('A');
    expect(component.scoreColor).toBe('#107C41');
  });
});
