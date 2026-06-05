import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComandaRegistro } from './pedido-registro';

describe('ComandaRegistro', () => {
  let component: ComandaRegistro;
  let fixture: ComponentFixture<ComandaRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComandaRegistro],
    }).compileComponents();

    fixture = TestBed.createComponent(ComandaRegistro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
