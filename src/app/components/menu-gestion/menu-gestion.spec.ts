import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuGestion } from './menu-gestion';

describe('MenuGestion', () => {
  let component: MenuGestion;
  let fixture: ComponentFixture<MenuGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuGestion],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuGestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
