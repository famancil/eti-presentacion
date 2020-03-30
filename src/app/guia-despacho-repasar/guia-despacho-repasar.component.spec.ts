import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaDespachoRepasarComponent } from './guia-despacho-repasar.component';

describe('GuiaDespachoRepasarComponent', () => {
  let component: GuiaDespachoRepasarComponent;
  let fixture: ComponentFixture<GuiaDespachoRepasarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuiaDespachoRepasarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuiaDespachoRepasarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
