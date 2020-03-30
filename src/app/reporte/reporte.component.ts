/*import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';
import {Component, ViewChild, OnInit, ElementRef, Renderer2} from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment-mini';
import { FormBuilder } from '@angular/forms';
import {
    NgbDatepicker, 
    NgbInputDatepicker, 
    NgbDateStruct, 
    NgbCalendar, 
    NgbDateAdapter,
    NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {NgModel} from "@angular/forms";
import {Subscription} from 'rxjs';
import { environment } from '../../environments/environment';
import { GuiaService } from '../guia.service';
import { NgxSpinnerService } from "ngx-spinner";
import { TokenStorageService } from '../auth/token-storage.service';
import { ParametroService } from '../parametro.service';

//Para datepickerRange
const now = new Date();
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

const NB_ITEMS = 1200;

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {


  //DatePicker Range
  startDate: NgbDateStruct;
  maxDate: NgbDateStruct;
  minDate: NgbDateStruct;
  hoveredDate: NgbDateStruct;
  fromDate: any;
  toDate: any;
  //model: any;
  private _subscription: Subscription;
  private _selectSubscription: Subscription;
  @ViewChild("d") input: NgbInputDatepicker;
  @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('myRangeInput') myRangeInput: ElementRef;

  isHovered = date => 
  this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  ///

  centros: any[]=[];
  centro:any[] = [];
  rolesGrant:any[];

  searchForm;
  selected: {startDate: Date, endDate: Date};

  lastTime = 12;

  barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  barChartLabels: Label[] = ['Emitidas', 'Escaneadas', 'Repasadas', 'Escaneada-Repasada'];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [pluginDataLabels];


  barChartData: ChartDataSets[] = [
	    { data: [100] }
	  ];

  showGraph = false;

  constructor(private formBuilder: FormBuilder, element: ElementRef, 
    private renderer: Renderer2, private guiaService: GuiaService,
    private _parserFormatter: NgbDateParserFormatter, private router: Router,
    private spinner: NgxSpinnerService,
    private parametroService: ParametroService, 
    private token: TokenStorageService) {
    this.searchForm = this.formBuilder.group({
      cod_centro: null,
      rangeDate: null
    });
  }

  ngOnInit() {

  	this.spinner.show('sp6'); 
 
    this.rolesGrant = this.token.getRoles();
    for(let i=0;i<this.rolesGrant.length;i++){
      if(!this.centros.includes(this.rolesGrant[i].valor_dom)){
        this.centros.push(this.rolesGrant[i].valor_dom)
        this.centro.push(this.rolesGrant[i].valor_dom)
      }
    }

    const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(20, 'days').format('YYYY-MM-DD');

    this.startDate = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate()};
    this.minDate = {year: now.getFullYear() - 1, month: now.getMonth() + 1, day: now.getDate()};
    
    let fecha_comienzo = new Date();
    let fecha_final = new Date();

    this.parametroService.getParametroDefault('Tiempo Desfase').
    subscribe((data: any)=>{

      if(data){
        this.lastTime = +data;
        fecha_comienzo.setHours(fecha_comienzo.getHours()-this.lastTime);
        let t_inicio = {hour:  fecha_comienzo.getHours(), minute: fecha_comienzo.getMinutes()};
        let t_final = {hour:  fecha_final.getHours(), minute: fecha_final.getMinutes()};

        let dia = 0;
        if(fecha_final.getHours()< this.lastTime) dia = 1;*/
        /*this.dataset = this.llenarGrilla("EMITIDA_SII", this.centros,
          dia,t_inicio,t_final);*/
        /*this.guiaService.getTotalEmitidasByHoras(dia,t_inicio,t_final,
        	this.centros).
    	subscribe((total: any[][])=>{
    		if(total){
	    		console.log(total)
	    		let colors =['red','blue','green']
	    		this.barChartData.splice(0, 1);*/
	    		/*for (let i = 0; i < total.length; i++) {
	    			this.barChartData.push( {data: total[i],
	    				label: this.centros[i], 
	    				backgroundColor: colors[i],
				   		hoverBackgroundColor: colors[i]})
	    		}*/


	    		/*this.barChartData = [
				    { data: [1000, 500, 200, 300], label: '08AL', 
				    backgroundColor: 'red',
				    hoverBackgroundColor: 'red'  },
				    { data: [1000, 200, 150, 750], label: '05CC', 
				    backgroundColor: 'blue',
				    hoverBackgroundColor: 'blue'  },
				    { data: [1000, 600, 200, 200], label: '05SA', 
				    backgroundColor: 'green',
				    hoverBackgroundColor: 'green'  }
				];

				//this.showGraph = tr;
	    		this.spinner.hide('sp6'); 

    		}

    	});
        
      }
    });

    /*this.barChartData = [
	    { data: [100, 59, 80, 81], label: 'Hoy', backgroundColor: 'blue',
	    hoverBackgroundColor: 'blue '  }
	    //{ data: [28, 48, 40, 19], label: 'Series B' }
	  ];*/

  /*}

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public randomize(): void {
    // Only Change 3 values
    const data = [
      Math.round(Math.random() * 100),
      59,
      80,
      (Math.random() * 100)];
    this.barChartData[0].data = data;
  }

  onSubmit(searchData){

    if(!this.fromDate)
      this.fromDate = this.startDate

    if(this.fromDate && this.toDate == null){
      //console.log("Servicio 1")
      let fecha_inicio = this.fromDate.year + "-" 
      + this.fromDate.month + "-" +this.fromDate.day

      //console.log(fecha_inicio)

      this.spinner.show('sp6');
      this.dataset = this.llenarGrillaRangoFecha(fecha_inicio,fecha_inicio,
        "00:00","23:59",this.centro);
      //this.llenarGrillaRangoFecha(fecha_inicio,null);
    }
    if(this.fromDate && this.toDate){
      //console.log("Servicio 2")
      let fecha_inicio = this.fromDate.year + "-" 
      + this.fromDate.month + "-" +this.fromDate.day
      let fecha_final = this.toDate.year + "-" 
      + this.toDate.month + "-" +this.toDate.day

      this.spinner.show('sp6');
      this.dataset = this.llenarGrillaRangoFecha(fecha_inicio,fecha_final,
        "00:00","23:59",this.centro);
      //this.llenarGrillaRangoFecha(fecha_inicio,fecha_final);
    }
  }

  onDateSelection(date: NgbDateStruct) {
    let parsed = '';
    if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
        this.toDate = date;
        this.input.close();
    } else {
        this.toDate = null;
        this.fromDate = date;
    }
    if(this.fromDate) {
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if(this.toDate) {
      parsed += ' - ' + this._parserFormatter.format(this.toDate);
    }
   
    this.renderer.setProperty(this.myRangeInput.nativeElement, 'value', parsed);
  }

}*/
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

