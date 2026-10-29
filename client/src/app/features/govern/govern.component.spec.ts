import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GovernComponent } from './govern.component';
import { MockHttpService } from '../../core/services/mock-http.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('GovernComponent', () => {
  let component: GovernComponent;
  let fixture: ComponentFixture<GovernComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovernComponent],
      providers: [
        MockHttpService,
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GovernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load dashboard data', () => {
    expect(component).toBeTruthy();
    expect(component.kpis).toBeDefined();
  });
});
