import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComandaReporte } from './comanda-reporte';

describe('ComandaReporte', () => {
  let component: ComandaReporte;
  let fixture: ComponentFixture<ComandaReporte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComandaReporte],
    }).compileComponents();

    fixture = TestBed.createComponent(ComandaReporte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
