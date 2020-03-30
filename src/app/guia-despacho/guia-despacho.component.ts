//import { Component, OnInit, Input } from '@angular/core';
import {Component, ViewChild, OnInit, ElementRef, Renderer2} from '@angular/core';
import {
  AngularGridInstance,
  Column,
  FieldType,
  Filters,
  Formatter,
  Formatters,
  GridOption,
  GridService,
  GridStateChange,
  JQueryUiSliderOption,
  MultipleSelectOption,
  OperatorType,
} from 'angular-slickgrid';
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


const AtrFormatter: Formatter = (row, cell, value, columnDef, dataContext) => {
  
  switch(value) { 
   case true: { 
      return '<div align="center" style="color:green;"><i class="fa fa-check fa-lg" aria-hidden="true"></i></div>'
      break; 
   }
   case false: {
      return '<div align="center" style="color:red;"><i class="fa fa-times fa-lg" aria-hidden="true"></i></div>' 
      break; 
   }
   case null: {
      return '<div align="center" style="color:gray;"><i class="fa fa-circle-o fa-lg" aria-hidden="true"></i></div>' 
      break; 
   }
   default: {
      return value
      break; 
   }
  }
  //return value ? '<span style="color:red;"> '+value+'</span> '+`<i class="fa fa-fire red" aria-hidden="true" style="color:red;"></i>` : { text: '<i class="fa fa-snowflake-o" aria-hidden="true"></i>', addClasses: 'lightblue', toolTip: 'Freezing' };
};

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
  selector: 'app-guia-despacho',
  templateUrl: './guia-despacho.component.html',
  styleUrls: ['./guia-despacho.component.css']
})
export class GuiaDespachoComponent implements OnInit {

  gridService: GridService;
  gridObj: any;
  dataviewObj: any;

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

  obras: any[];
  estados: any[];
  escaneados: any[];
  selectedCentro:any;

  angularGrid: AngularGridInstance;
  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any[];
  selectedLanguage: string;

  searchForm;
  selected: {startDate: Date, endDate: Date};

  lastTime = 12;


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
  	this.obras = ['Edificio','Torre','Pavimento']
  	this.estados = ['Em','An']
  	this.escaneados = ['X','--']
    this.columnDefinitions = [
      {
        id: 'nroGuiaDespacho', name: 'Nro Guia Despacho', field: 'nroGuiaDespacho', 
        minWidth: 120, width: 140,
        formatter: Formatters.hyperlink,
        selectable: true,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'fecha', name: 'Fecha Guia', field: 'fecha',
        sortable: true, 
        minWidth: 150, width: 170,
       	exportWithFormatter: true,
        type: FieldType.date,
        formatter: Formatters.dateTimeIso,
        filterable: true,
        /*filter: {
          model: Filters.compoundDate,
        }*/
      },
      {
        id: 'centro', name: 'Centro', field: 'centro',
        minWidth: 80, width: 100,
        sortable: true,
        filterable: true
      },
      {
        id: 'cliente', name: 'Cliente', field: 'cliente', 
        minWidth: 160, width: 180,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'obra', name: 'Obra', field: 'obra',
        minWidth: 160, width: 180,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'notaVta', name: 'Nota Vta', field: 'notaVta',
        minWidth: 80, width:100,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'estado', name: 'Estado', field: 'estado',
        minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        /*formatter : function(row, cell, value, columnDef, dataContext){
            return value.estado;
        }*/
      },
      {
        id: 'escaneado', name: 'Escaneado', field: 'escaneado',
        minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        formatter: AtrFormatter
      },
      {
        id: 'repasado', name: 'Repasado', field: 'repasado',
        minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        formatter: AtrFormatter
      },
      {
        id: 'foliok', name: 'Folio Ok', field: 'foliok',
        minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        formatter: AtrFormatter
      },
      {
        id: 'firma', name: 'Firma', field: 'firma', 
         minWidth: 100, width: 120,
        sortable: true,
        type: FieldType.string,
        formatter: AtrFormatter
      },
      {
        id: 'obs', name: 'Obs', field: 'obs',
         minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        formatter: AtrFormatter
      },
      {
        id: 'solnc', name: 'Sol. NC', field: 'solnc',
         minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        columnGroup: 'Atributos',
        headerCssClass: 'currency',
        formatter: AtrFormatter
      },
      {
        id: 'devuelto', name: 'Devuelto', field: 'devuelto', 
         minWidth: 100, width: 120,
        sortable: true,
        type: FieldType.string,
        columnGroup: 'Atributos',
        headerCssClass: 'currency',
        formatter: AtrFormatter
      },
      {
        id: 'adiciones', name: 'Adiciones', field: 'adiciones',
         minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        columnGroup: 'Atributos',
        headerCssClass: 'currency',
        formatter: AtrFormatter
      },
      {
        id: 'disposicion', name: 'Disposición', field: 'disposicion',
         minWidth: 100, width: 120, 
        sortable: true,
        type: FieldType.string,
        columnGroup: 'Atributos',
        headerCssClass: 'currency',
        formatter: AtrFormatter
      },
      /*{
        id: 'bombeo', name: 'Bombeo', field: 'bombeo', 
         minWidth: 100, width: 120,
        sortable: true,
        type: FieldType.string,
        columnGroup: 'Atributos',
        headerCssClass: 'currency'
      },*/

    ];

    const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(20, 'days').format('YYYY-MM-DD');

    this.gridOptions = {
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      enableCellNavigation: true,
      enableExcelCopyBuffer: true,
      enableFiltering: true,
      createPreHeaderPanel: true,
      showPreHeaderPanel: true,
      preHeaderPanelHeight: 25,
      explicitInitialization: true,
      enableGridMenu: false
    };

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
        if(fecha_final.getHours()< this.lastTime) dia = 1;
        this.dataset = this.llenarGrilla("EMITIDA_SII", this.centros,
          dia,t_inicio,t_final);
      }

    });

    // Llenar dataset
    //this.dataset = this.llenarGrilla("EMITIDA_SII", this.centros);

  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
    this.dataviewObj = angularGrid.dataView;
    this.gridService = angularGrid.gridService;
  }

  llenarGrilla(estado,centros,dia,t_inicio,t_final): any[] {
    const tempDataset = [];

    this.guiaService.getAllGuiaEmiScanRepByHoras(dia,t_inicio,t_final,
      centros,estado).subscribe((data: any[])=>{ 
    //this.guiaService.getAllGuiaByEstado(estado, centros).subscribe((data: any[])=>{ 
    //this.guiaService.getGuiasFiltradas(this.token.getEmail()).subscribe((data: any[])=>{   
      if(data){  
        for (let i = 0; i < data.length; i++) {

          let escaneado = null
          if(data[i].guiaEstado.id == 6 || data[i].guiaEstado.id == 8) 
            escaneado = true

          let repasado = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.folios_ok !== 0) 
            repasado = true 

          let folios_ok = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.folios_ok === 1) 
            folios_ok = true
          else if(data[i].guiaRepaso && data[i].guiaRepaso.folios_ok === 0) 
            folios_ok = false

          let firma = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.rc_firmado === 1) 
            firma = true
          else if(data[i].guiaRepaso && data[i].guiaRepaso.rc_firmado === 0) 
            firma = false 

          let obs = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.obs) 
            obs = true
          
          let solnc = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.solicitud_nc == 1) 
            solnc = true
          else if(data[i].guiaRepaso && 
            data[i].guiaRepaso.solicitud_nc == 0) 
            solnc = false

          let devuelto = null
          if(data[i].guiaRepaso && 
            data[i].guiaRepaso.camion_devuelto == 1) 
            devuelto = true
          else if(data[i].guiaRepaso && 
            data[i].guiaRepaso.camion_devuelto == 0) 
            devuelto = false

          let ac_firmado = null
          if(data[i].guiaRepaso && (
              (data[i].guiaRepaso.ac_adic_cant != null 
              &&  data[i].guiaRepaso.ac_adic_cant != '') || 
              (data[i].guiaRepaso.ac_solicitante_adit != null 
              &&  data[i].guiaRepaso.ac_solicitante_adit != '' )
            ))  
            ac_firmado = true
          else if(data[i].guiaRepaso && 
            data[i].guiaRepaso.ac_firmado_adit === 0) 
            ac_firmado = false

          let dh_firmado = null
          if(data[i].guiaRepaso && (
              (data[i].guiaRepaso.ac_hormigon != null 
              &&  data[i].guiaRepaso.ac_hormigon != '') || 
              (data[i].guiaRepaso.ac_solicitante_hormigon != null 
              &&  data[i].guiaRepaso.ac_solicitante_hormigon != '' )
            )) 
            dh_firmado = true
          else if(data[i].guiaRepaso && 
            data[i].guiaRepaso.ac_firmado_hormigon === 0) 
            dh_firmado = false

          /*if(data[i].guiaRepaso && data[i].guiaRepaso.bom_cod_bomba) 
            var bombeo = 'X'
          else var bombeo = '--'*/

          tempDataset.push({
            id: data[i].id,
            fecha: data[i].fechaCreacion,
            centro: data[i].tick_ship_plant_loc_code,
            cliente: data[i].cliente,
            obra: data[i].obra,
            notaVta: data[i].tick_order_code,
            nroGuiaDespacho: data[i].folio_sii,
            estado: data[i].guiaEstado.estado,
            escaneado: escaneado,
            repasado: repasado, 
            foliok: folios_ok, 
            firma: firma, 
            obs: obs, 
            solnc: solnc, 
            devuelto: devuelto, 
            adiciones: ac_firmado, 
            disposicion: dh_firmado,
            //bombeo: bombeo,  
          });
        }
      }
      this.angularGrid.dataView.refresh();
      this.spinner.hide('sp6');      
    });   

    return tempDataset;
  }

  /*onChangeCentro(newValue) {
    console.log(newValue);
  }*/

  onCellClicked(e, args) {
    
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    
    var datasetIds = this.dataset.map(function (data) {
      return data.id
    });
    datasetIds = datasetIds.slice(datasetIds.indexOf(metadata.dataContext.id), datasetIds.length)
    window.sessionStorage.setItem('datasetIds', JSON.stringify(datasetIds));
    window.sessionStorage.setItem('nroGuiaDespacho', metadata.dataContext.nroGuiaDespacho);
    
    this.router.navigate(['/guiasDespacho', metadata.dataContext.id]);
  }

  onSubmit(searchData){

    if(!this.fromDate)
      this.fromDate = this.startDate
    /*console.log(this.fromDate)
    console.log(this.startDate)*/
    /*console.log(this.fromDate)
    console.log(this.toDate)
    console.log(searchData.cod_centro)
    //console.log(this.centros)
    this.spinner.show('sp6'); 
    if(this.fromDate && this.toDate)
      this.dataset = this.llenarGrillaRangoFecha("EMITIDA_SII", searchData.cod_centro);
    else if(this.fromDate)
      this.toDate = this.fromDate
    else 
      this.dataset = this.llenarGrilla("EMITIDA_SII", searchData.cod_centro);*/

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

  llenarGrillaRangoFecha(fecha_inicio,fecha_final,t_inicio,t_final,centros): any[] {
    const tempDataset = [];

    //this.guiaService.getAllGuiaByEstadoAndHoras(this.fromDate, this.toDate,
    this.guiaService.getAllGuiaEmiScanRepByRangeDate(fecha_inicio,
      fecha_final, t_inicio,t_final, centros).subscribe((data: any[])=>{ 
    //this.guiaService.getGuiasFiltradas(this.token.getEmail()).subscribe((data: any[])=>{   
      if(data){  
        for (let i = 0; i < data.length; i++) {

          let escaneado = null
          if(data[i].guiaEstado.id == 6 || data[i].guiaEstado.id == 8) 
            escaneado = true

          let repasado = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.folios_ok !== 0) 
            repasado = true 

          let folios_ok = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.folios_ok === 1) 
            folios_ok = true
          else if(data[i].guiaRepaso && data[i].guiaRepaso.folios_ok === 0) 
            folios_ok = false

          let firma = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.rc_firmado === 1) 
            firma = true
          else if(data[i].guiaRepaso && data[i].guiaRepaso.rc_firmado === 0) 
            firma = false 

          let obs = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.obs) 
            obs = true
          
          let solnc = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.solicitud_nc) 
            solnc = true
          else solnc = false

          let devuelto = null
          if(data[i].guiaRepaso && data[i].guiaRepaso.camion_devuelto) 
            devuelto = true
          else devuelto = false

          let ac_firmado = null
          if(data[i].guiaRepaso && (
              (data[i].guiaRepaso.ac_adic_cant != null 
              &&  data[i].guiaRepaso.ac_adic_cant != '') || 
              (data[i].guiaRepaso.ac_solicitante_adit != null 
              &&  data[i].guiaRepaso.ac_solicitante_adit != '' )
            ))  
            ac_firmado = true
          else if(data[i].guiaRepaso && 
            data[i].guiaRepaso.ac_firmado_adit === 0) 
            ac_firmado = false

          let dh_firmado = null
          if(data[i].guiaRepaso && (
              (data[i].guiaRepaso.ac_hormigon != null 
              &&  data[i].guiaRepaso.ac_hormigon != '') || 
              (data[i].guiaRepaso.ac_solicitante_hormigon != null 
              &&  data[i].guiaRepaso.ac_solicitante_hormigon != '' )
            )) 
            dh_firmado = true
          else if(data[i].guiaRepaso && 
            data[i].guiaRepaso.ac_firmado_hormigon === 0) 
            dh_firmado = false

          /*if(data[i].guiaRepaso && data[i].guiaRepaso.bom_cod_bomba) 
            var bombeo = 'X'
          else var bombeo = '--'*/

          tempDataset.push({
            id: data[i].id,
            fecha: data[i].fechaCreacion,
            centro: data[i].tick_ship_plant_loc_code,
            cliente: data[i].cliente,
            obra: data[i].obra,
            notaVta: data[i].tick_order_code,
            nroGuiaDespacho: data[i].folio_sii,
            estado: data[i].guiaEstado.estado,
            escaneado: escaneado,
            repasado: repasado, 
            foliok: folios_ok, 
            firma: firma, 
            obs: obs, 
            solnc: solnc, 
            devuelto: devuelto, 
            adiciones: ac_firmado, 
            disposicion: dh_firmado,
            //bombeo: bombeo,  
          });
        }
      }
      this.angularGrid.dataView.refresh();
      this.spinner.hide('sp6');      
    });   

    return tempDataset;
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

}
