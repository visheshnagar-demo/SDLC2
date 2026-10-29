import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MigrateComponent } from './migrate.component';
import { MockHttpService } from '../../core/services/mock-http.service';

describe('MigrateComponent', () => {
  let component: MigrateComponent;
  let fixture: ComponentFixture<MigrateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MigrateComponent],
      providers: [MockHttpService]
    }).compileComponents();

    fixture = TestBed.createComponent(MigrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load migration jobs', () => {
    expect(component).toBeTruthy();
    expect(component.activeBatchId).toBe('BATCH-LIVE-01');
  });
});
