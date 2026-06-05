import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaCobros } from './caja-cobros';

describe('CajaCobros', () => {
  let component: CajaCobros;
  let fixture: ComponentFixture<CajaCobros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaCobros],
    }).compileComponents();

    fixture = TestBed.createComponent(CajaCobros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
