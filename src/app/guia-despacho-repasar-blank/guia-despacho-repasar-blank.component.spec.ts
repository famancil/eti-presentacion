import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaDespachoRepasarBlankComponent } from './guia-despacho-repasar-blank.component';

describe('GuiaDespachoRepasarBlankComponent', () => {
  let component: GuiaDespachoRepasarBlankComponent;
  let fixture: ComponentFixture<GuiaDespachoRepasarBlankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuiaDespachoRepasarBlankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuiaDespachoRepasarBlankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
