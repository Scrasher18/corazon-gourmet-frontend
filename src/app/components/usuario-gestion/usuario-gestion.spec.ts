import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioGestion } from './usuario-gestion';

describe('UsuarioGestion', () => {
  let component: UsuarioGestion;
  let fixture: ComponentFixture<UsuarioGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioGestion],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioGestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
