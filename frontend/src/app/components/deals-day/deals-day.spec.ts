import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealsDay } from './deals-day';

describe('DealsDay', () => {
  let component: DealsDay;
  let fixture: ComponentFixture<DealsDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealsDay],
    }).compileComponents();

    fixture = TestBed.createComponent(DealsDay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
