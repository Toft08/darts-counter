import { ComponentFixture, TestBed } from '@angular/core/testing';

import { X01 } from './x01';

describe('X01', () => {
  let component: X01;
  let fixture: ComponentFixture<X01>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [X01]
    })
    .compileComponents();

    fixture = TestBed.createComponent(X01);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
