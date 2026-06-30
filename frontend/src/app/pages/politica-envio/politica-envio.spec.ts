import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PoliticaEnvioPage } from './politica-envio';

describe('PoliticaEnvioPage', () => {
  let component: PoliticaEnvioPage;
  let fixture: ComponentFixture<PoliticaEnvioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticaEnvioPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PoliticaEnvioPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
