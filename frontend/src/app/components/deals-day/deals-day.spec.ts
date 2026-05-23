import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DealsDay } from './deals-day';

describe('DealsDay', () => {
  let component: DealsDay;
  let fixture: ComponentFixture<DealsDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealsDay],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DealsDay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
