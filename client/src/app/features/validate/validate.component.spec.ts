import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidateComponent } from './validate.component';
import { MockHttpService } from '../../core/services/mock-http.service';

describe('ValidateComponent', () => {
  let component: ValidateComponent;
  let fixture: ComponentFixture<ValidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateComponent],
      providers: [MockHttpService]
    }).compileComponents();

    fixture = TestBed.createComponent(ValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load validation queue', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab).toBe('metadata');
  });
});
