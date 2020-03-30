import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaDespachoOperacionComponent } from './guia-despacho-operacion.component';

describe('GuiaDespachoOperacionComponent', () => {
  let component: GuiaDespachoOperacionComponent;
  let fixture: ComponentFixture<GuiaDespachoOperacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuiaDespachoOperacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuiaDespachoOperacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
