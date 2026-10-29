import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransformComponent } from './transform.component';
import { MockHttpService } from '../../core/services/mock-http.service';

describe('TransformComponent', () => {
  let component: TransformComponent;
  let fixture: ComponentFixture<TransformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransformComponent],
      providers: [MockHttpService]
    }).compileComponents();

    fixture = TestBed.createComponent(TransformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load transform workspace', () => {
    expect(component).toBeTruthy();
    expect(component.selectedReportId).toBe('REP-10492');
  });
});
