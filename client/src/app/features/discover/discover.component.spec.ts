import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscoverComponent } from './discover.component';
import { MockHttpService } from '../../core/services/mock-http.service';

describe('DiscoverComponent', () => {
  let component: DiscoverComponent;
  let fixture: ComponentFixture<DiscoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverComponent],
      providers: [MockHttpService]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load report catalog', () => {
    expect(component).toBeTruthy();
    expect(component.columns.length).toBeGreaterThan(0);
  });
});
