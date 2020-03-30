import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
  SelectedRange,
  OnEventArgs
} from 'angular-slickgrid';
import {
    NgbDatepicker, 
    NgbInputDatepicker, 
    NgbDateStruct, 
    NgbCalendar, 
    NgbDateAdapter,
    NgbDateParserFormatter,
    NgbModal, 
    NgbActiveModal, 
    NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {GuiaService} from '../guia.service'
import { ParametroService } from '../parametro.service';
import {DomSanitizer} from '@angular/platform-browser';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import {NgModel} from "@angular/forms";
import {Subscription} from 'rxjs';
import moment from 'moment-mini';
import {DatePipe} from '@angular/common'
import { TokenStorageService } from '../auth/token-storage.service';

const DropdownFormatters: Formatter = (row,cell,value,columnDef,dataContext) =>{
  return `<div class="col">
  <div ngbDropdown class="d-inline-block">
      <button class="btn btn-outline-primary" id="dropdownBasic1" ngbDropdownToggle>Toggle dropdown</button>
      <div ngbDropdownMenu aria-labelledby="dropdownBasic1">
        <button ngbDropdownItem>Action - 1</button>
        <button ngbDropdownItem>Another Action</button>
        <button ngbDropdownItem>Something else is here</button>
      </div>
    </div>
  </div>`
}

const EstadoFormatter: Formatter = (row, cell, value, columnDef, dataContext) => {
  switch(value.estado) { 
   case "ANULADA": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#898585;"> '+value.estado+'</div>' 
      break; 
   }
   case "EMITIDA_SII": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#00cc00;"> '+value.estado+'</div>' 
      break; 
   }
   case "SOL_EMISION": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#ff471a;"> '+value.estado+'</div>' 
      break; 
   } 
   case "EN_ESPERA": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#e6e600;"> '+value.estado+'</div>' 
      break; 
   }
   case "CANCELADA": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#d0d0c8;"> '+value.estado+'</div>' 
      break; 
   }
   case "EN_ESPERA_DE_SELLO": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#e6e600;"> '+value.estado+'</div>' 
      break; 
   }
   case "EN_ESPERA_CONFIRMACION_EMISION": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#e6e600;"> '+value.estado+'</div>' 
      break; 
   }  
   case "TIMEOUT_EXPIRADO": { 
      //statements;
      return '<div class="container-fluid" style="background-color:#d0d0c8;"> '+value.estado+'</div>' 
      break; 
   } 
   default: { 
      //statements;
      return value.estado
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
  selector: 'app-guia-despacho-operacion',
  templateUrl: './guia-despacho-operacion.component.html',
  styleUrls: ['./guia-despacho-operacion.component.css']
})
export class GuiaDespachoOperacionComponent implements OnInit {

  @ViewChild('estado') private estado;

  gridService: GridService;
  gridObj: any;
  dataviewObj: any;
  
  angularGrid: AngularGridInstance;
  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any[];

  gridObjHistorial: any;
  dataviewObjHistorial: any;
  columnDefinitionsHistorial: Column[];
  gridOptionsHistorial: GridOption;
  datasetHistorial: any[];

  centros=[];

  modalReference: any;
  modalContent: any;

  guiaPDF: any;
  urls_PDF: any[] = [];
  url_pdf_cedible: any;
  embedURL: any;

  emitirForm;
  anularForm;
  cancelarForm;
  searchForm;

  filters;
  centro:any[] = [];

  rangeDate;

  rolesGrant:any[];
  isFilter=false;
  canAnularOrCancelar = false;
  canEmitirOrSello = false;
  canDocument = false;

  startTime = {hour: 0, minute: 0};
  endTime = {hour:  new Date().getHours(), minute: new Date().getMinutes()};
  todaysDataTime = '';
  isFilterHour = false;

  lastTime = 12;

  options:any[];
  guiaSelected;

  flagSelloRequerido;

  toggle = true;
  electronica = true;
  cedible = false;

  //Perfilamiento
  modules:any[]=[];
  modOption:any[]=[];

  //Si esta en IE
  isIEOrEdge;

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

  constructor(private guiaService : GuiaService,
  	private modalService: NgbModal, private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder, private spinner: NgxSpinnerService, element: ElementRef, 
    private renderer: Renderer2, private _parserFormatter: NgbDateParserFormatter,
    public datepipe: DatePipe, private token: TokenStorageService,
    public activeModal: NgbActiveModal, 
    private parametroService: ParametroService) { 

    /*this.searchForm = this.formBuilder.group({
      rangeDate: null
    });*/
    this.emitirForm = this.formBuilder.group({
      nroSello: [null, Validators.required],
    })
    this.anularForm = this.formBuilder.group({
      razones: [null, Validators.required],
    })
    this.cancelarForm = this.formBuilder.group({
      razones: [null, Validators.required],
    })
  }

  ngOnInit() {

    console.log("Tiempo Desfase: ",this.lastTime)


    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)
    
    this.spinner.show('sp6'); 

    this.flagSelloRequerido = true;

    this.rolesGrant = this.token.getRoles();
    for(let i=0;i<this.rolesGrant.length;i++){
      if(!this.centros.includes(this.rolesGrant[i].valor_dom)){
        this.centros.push(this.rolesGrant[i].valor_dom)
        this.centro.push(this.rolesGrant[i].valor_dom)
      }

      //if(this.rolesGrant[i].mod_nombre === 'GuiaDespacho' &&
      if(this.rolesGrant[i].rol_name === 'Supervisor' ||
      //    this.rolesGrant[i].rol_name === 'Administrativo' ||
          this.rolesGrant[i].rol_name === 'Administrador'){
        this.isFilter = true;
        this.canAnularOrCancelar = true;
        this.canEmitirOrSello = true;
        this.canDocument=true;
      }

      if(this.rolesGrant[i].rol_name === 'Operador')
        this.canEmitirOrSello = true;

      if(this.rolesGrant[i].rol_name === 'Operador +'){
        this.canEmitirOrSello = true;
        this.canDocument=true;
      }

      if(this.rolesGrant[i].rol_name === 'Visualizador'){
        this.isFilter = true;
        this.canDocument=true;
      }

      if(this.rolesGrant[i].mod_nombre === 'GuiaDespacho' &&
        !this.modOption.includes(this.rolesGrant[i].opc_nombre))
        this.modOption.push(this.rolesGrant[i].opc_nombre)
    }
  	
    //console.log(this.modOption.length)

	  this.columnDefinitions = [
      {
        id: 'fecha_creacion', name: 'Fecha Guía', field: 'fecha_creacion', 
        minWidth: 80, width: 100,
        type: FieldType.string, 
        formatter: Formatters.dateTimeIso,     
        filterable: true
      },
      {
        id: 'nro_ticket', name: 'N° Ticket', field: 'nro_ticket', 
        minWidth: 30, width: 50,
        selectable: true,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'nroPedido', name: 'Nro. Pedido', field: 'nroPedido',
        sortable: true, 
        minWidth: 50, width: 70,
       	exportWithFormatter: true,
        type: FieldType.string,
        filterable: true
      },
      {
        id: 'ship_plant_loc', name: 'Centro', field: 'ship_plant_loc', 
        minWidth: 50, width: 70,
        selectable: true,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'driver', name: 'Operador Mixer', field: 'driver',
        minWidth: 80, width: 100,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'cod_camion', name: 'Número Camión', field: 'cod_camion',
        minWidth: 40, width: 60,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'num_sello', name: 'Número Sello', field: 'num_sello',
        minWidth: 40, width: 60,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'prod_code', name: 'Cod. Prd.', field: 'prod_code',
        minWidth: 40, width: 60,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'delv_qty', name: 'M3', field: 'delv_qty',
        minWidth: 40, width: 60,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'cliente', name: 'Cliente', field: 'cliente',
        minWidth: 160, width: 180,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'obra', name: 'Obra', field: 'obra',
        minWidth: 140, width: 160,
        filterable: true, sortable: true,
        type: FieldType.string
      },
      {
        id: 'estado', name: 'Estado', field: 'estado',
        minWidth: 120, width: 140, 
        sortable: true,
        type: FieldType.string,
        filterable: true,
        formatter: EstadoFormatter
        /*formatter : function(row, cell, value, columnDef, dataContext){
            return value.estado;
        }*/
      },
      {
        id: 'folio', name: 'Folio', field: 'folio',
        minWidth: 60, width: 80,
        filterable: true, sortable: true,
        type: FieldType.string,
        /*onCellClick: (e: Event, args: OnEventArgs) => {
          this.contextMenu(e,args.dataContext);
        }*/
      }
    ];

    const presetLowestDay = moment().add(-2, 'days').format('YYYY-MM-DD');
    const presetHighestDay = moment().add(20, 'days').format('YYYY-MM-DD');

    this.gridOptions = {
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      enableCellNavigation: true,
      enableFiltering: true,
      enableGridMenu: false,
      enableRowSelection: true,
      enableColumnPicker: true,

      presets: {
        // the column position in the array is very important and represent
        // the position that will show in the grid
        columns: [
          { columnId: 'fecha_creacion', width: 100},
          { columnId: 'nro_ticket', width: 50},
          { columnId: 'nroPedido', width: 50},
          { columnId: 'ship_plant_loc', width: 70},
          { columnId: 'driver', width: 100},
          { columnId: 'cod_camion', width: 60},
          { columnId: 'num_sello', width: 60},
          { columnId: 'prod_code', width: 60},
          { columnId: 'delv_qty', width: 60},
          { columnId: 'obra', width: 160},
          { columnId: 'estado', width: 140},
          { columnId: 'folio', width: 80}
        ]
      }
    };

    this.startDate = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate()};
    this.minDate = {year: now.getFullYear() - 1, month: now.getMonth() + 1, day: now.getDate()};

    let fecha_comienzo = new Date();
    let fecha_final = new Date();
    console.log("Tiempo Desfase: ",this.lastTime)

    this.parametroService.getParametroDefault('Tiempo Desfase').
    subscribe((data: any)=>{

      if(data){
        this.lastTime = +data;
        fecha_comienzo.setHours(fecha_comienzo.getHours()-this.lastTime);
        console.log("Tiempo Desfase: ",this.lastTime)
        let t_inicio = {hour:  fecha_comienzo.getHours(), minute: fecha_comienzo.getMinutes()};
        let t_final = {hour:  fecha_final.getHours(), minute: fecha_final.getMinutes()};

        let dia = 0;
        if(fecha_final.getHours()< this.lastTime) dia = 1;
        this.dataset = this.llenarGrillaHoras(dia,t_inicio,t_final);
      }

    });

    //this.dataset = this.llenarGrilla();
     
    //Oreja al servidor Proxy DTE para la llegada de más guias.
    this.listenServer();

  }

  listenServer(){
    this.guiaService.subscribe()
    .subscribe({
      next: (event) => {
        console.log('observer: ' + event.data);
        //let params = event.data.split("-");
        //const data = JSON.parse(event.data);
        //console.log(event.data.split("-"))
        //const guia_id = JSON.parse(params[0]);
        const guia_id = JSON.parse(event.data);
        var folio = null
        let prd = null
        let m3 = null
        
        this.guiaService.getGuiaById(guia_id).subscribe((data: any)=>{
          if(data){

            if(this.centro.includes(data.tick_ship_plant_loc_code)){
              /*if(data.guiaEstado.estado == 'ANULADA' || 
                data.guiaEstado.estado == 'EMITIDA_SII')*/
              if(data.guiaEstado.id > 4 && data.guiaEstado.id < 11) 
                  folio = data.folio_sii
              else folio = '--'
              //console.log()
              if(data.guiaDetalle && data.guiaDetalle.length > 0 && data.guiaDetalle[0].prod_code != null) 
                  prd = data.guiaDetalle[0].prod_code
              else prd = '--'

              if(data.guiaDetalle && data.guiaDetalle.length > 0 && data.guiaDetalle[0].delv_qty != null) 
                  m3 = data.guiaDetalle[0].delv_qty
              else m3 = '--'

              let ticket = data.tick_order_date + '-' + data.tick_order_code+ '-' + 
              data.tick_tkt_code;
      
              if(data.guiaEstado.estado == "EMITIDA_SII"){
                let fecha = this.datepipe.transform(data.fechaCreacion, 'yyyy-MM-dd')
                if(this.isIEOrEdge){
                  let fileURL = this.guiaService.getGuiaPDFString(data.folio_sii,
                    fecha);
                  this.urls_PDF.push({id:data.id , url_pdf: fileURL});
                }
                else {
                  this.guiaService.getGuiaPDFByTicket(data.folio_sii,
                    fecha).subscribe((result: any)=>{
                    
                    var fileURL = URL.createObjectURL(result);
                    this.urls_PDF.push({id:data.id , url_pdf: fileURL})
                    
                  });
                  
                }
              }

              //Busca si existe la guia en la grilla
              var item = this.dataset.filter(function(item) {
                  return item.id == guia_id
              })[0];
              
              if(item){
                
                let index = this.dataset.map(function(e) { return e.id; }).indexOf(guia_id);

                var row = this.dataviewObj.getItem(index);

                this.dataset[index].folio = folio
                this.dataset[index].tickOrderDate = data.tick_order_date
                this.dataset[index].nroPedido = data.tick_order_code
                this.dataset[index].nro_ticket = data.tick_tkt_code
                this.dataset[index].ticket = ticket
                this.dataset[index].tkt_date = data.tick_tkt_date
                this.dataset[index].cliente = data.cliente
                this.dataset[index].obra = data.obra
                this.dataset[index].driver_code = data.tick_driv_empl_code
                this.dataset[index].driver = data.driver
                this.dataset[index].ship_plant_code = data.tick_ship_plant_code
                this.dataset[index].ship_plant_loc = data.tick_ship_plant_loc_code + "-" + data.tick_ship_plant_code
                this.dataset[index].cod_camion = data.tick_truck_code
                this.dataset[index].patente = data.lic_num
                this.dataset[index].typed_time = data.tick_typed_time
                this.dataset[index].proj_code = data.tick_proj_code
                this.dataset[index].delv_addr = data.tick_delv_addr
                this.dataset[index].estado = data.guiaEstado
                this.dataset[index].num_sello = data.numero_sello
                this.dataset[index].prod_code = prd
                this.dataset[index].delv_qty = m3
                this.dataset[index].fecha_creacion = data.fechaCreacion
                
                this.dataset[index].estado

                this.gridObj.invalidateRow(index);
                this.gridObj.render();
               
              }
              else{ 
                console.log("No existe en el dataset");
                this.dataset.unshift({
                  id: data.id,
                  folio: folio,
                  tickOrderDate: data.tick_order_date,
                  nroPedido: data.tick_order_code,
                  nro_ticket: data.tick_tkt_code,
                  ticket: ticket,           
                  tkt_date: data.tick_tkt_date,
                  cliente: data.cliente,
                  obra: data.obra,
                  driver_code: data.tick_driv_empl_code,
                  driver: data.driver,
                  ship_plant_code: data.tick_ship_plant_code,
                  ship_plant_loc: data.tick_ship_plant_loc_code + "-" + data.tick_ship_plant_code,
                  cod_camion: data.tick_truck_code,
                  patente: data.lic_num,
                  typed_time: data.tick_typed_time,
                  proj_code: data.tick_proj_code,
                  delv_addr: data.tick_delv_addr,
                  estado: data.guiaEstado,
                  num_sello: data.numero_sello,
                  prod_code: prd,
                  delv_qty: m3,
                  fecha_creacion: data.fechaCreacion
                });
                this.spinner.hide('sp6');
                this.dataviewObj.refresh();
              }
            }
          }
          this.spinner.hide('sp6');
        });
      }
    });
  }

  /*angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
    this.dataviewObj = angularGrid.dataView;
    this.gridService = angularGrid.gridService;
    console.log(this.angularGrid)
  }*/
  gridReady(grid) {
    this.gridObj = grid;
    grid.onCellChange.subscribe((e, args) => {
      console.log('onCellChange', args);
    });
    grid.onContextMenu.subscribe((e)=> {

      e.preventDefault();
      var cell = grid.getCellFromEvent(e);      

      this.options = this.dataset[cell.row].estado.guiaEstadoOpcion.map((x) => x.opcion);
      
      //Para el caso Ver Guia Electrónica
      if(this.options.includes("Ver Guia Electrónica")){

        if(!this.canDocument){
          let x = this.options.map(function(opt) { return opt; })
                  .indexOf("Ver Guia Electrónica");

          //console.log(x);
          this.options.splice(x,1)
        }
      }

      //Para el caso Emitir
      if(this.options.includes("Emitir")){

        if(!this.canEmitirOrSello){
          let x = this.options.map(function(opt) { return opt; })
                  .indexOf("Emitir");

          //console.log(x);
          this.options.splice(x,1)
        }
      }

      //Para el caso Ingresar Sello
      if(this.options.includes("Ingresar Sello")){

        if(!this.canEmitirOrSello){
          let x = this.options.map(function(opt) { return opt; })
                  .indexOf("Ingresar Sello");

          //console.log(x);
          this.options.splice(x,1)
        }
      }

      //Para el caso Confirmar
      if(this.options.includes("Confirmar")){

        if(!this.canEmitirOrSello){
          let x = this.options.map(function(opt) { return opt; })
                  .indexOf("Confirmar");

          //console.log(x);
          this.options.splice(x,1)
        }
      }

      //Para el caso Anular
      if(this.options.includes("Anular")){

        if(!this.canAnularOrCancelar){
          let x = this.options.map(function(opt) { return opt; })
                  .indexOf("Anular");

          //console.log(x);
          this.options.splice(x,1)
        }
      }
      //console.log(this.options)

      //Para el caso Cancelar
      if(this.options.includes("Cancelar")){

        if(!this.canAnularOrCancelar){
          let x = this.options.map(function(opt) { return opt; })
                  .indexOf("Cancelar");

          this.options.splice(x,1)
        }
      }
      //console.log(this.options)


      this.guiaSelected = this.dataset[cell.row]
      $("#contextMenu")
          .data("row", cell.row)
          .css("top", e.pageY)
          .css("left", e.pageX)
          .show();
      
      $("body").one("click", function () {
        $("#contextMenu").hide();
      });
    });

  }

  dataviewReady(dataview) {
    this.dataviewObj = dataview;
  }
  dataviewReadyHistorial(dataview) {
    this.dataviewObjHistorial = dataview;
  }

  llenarGrilla(): any[] {
  	const tempDataset = [];

  	this.guiaService.getAllGuiasFiltradaPorCentros(this.centro).subscribe((data: any[])=>{ 
      console.log("La data: "+data)
      if(data){
  	  	for (let i = 0; i < data.length; i++) {

          var folio = null
          let prd = null, m3=null
          
          if(data[i].folio_sii || data[i].folio_sii !=='') folio = data[i].folio_sii
          else folio = '--'

          if(data[i].guiaDetalle && data[i].guiaDetalle.length > 0 && data[i].guiaDetalle[0].prod_code != null) 
              prd = data[i].guiaDetalle[0].prod_code
          else prd = '--'

          if(data[i].guiaDetalle && data[i].guiaDetalle.length > 0 && data[i].guiaDetalle[0].delv_qty != null) 
              m3 = data[i].guiaDetalle[0].delv_qty
          else m3 = '--'

          let ticket = data[i].tick_order_date + '-' + data[i].tick_order_code+ '-' + 
          data[i].tick_tkt_code;
          let nroPedido = data[i].tick_order_date + '-' + data[i].tick_order_code;


  	    	if(data[i].guiaEstado.estado == "EMITIDA_SII"){
          
            let fecha = this.datepipe.transform(data[i].fechaCreacion, 'yyyy-MM-dd')
    				if(this.isIEOrEdge){
              let fileURL = this.guiaService.getGuiaPDFString(data[i].folio_sii,
              fecha);
              this.urls_PDF.push({id:data[i].id , url_pdf: fileURL});
            }
            else{
              this.guiaService.getGuiaPDFByTicket(data[i].folio_sii,
                fecha).subscribe((result: any)=>{
      			      
                  var fileURL = URL.createObjectURL(result);
                  this.urls_PDF.push({id:data[i].id , url_pdf: fileURL})
      			     
              });
            } 
  			  }

          var item = this.dataset.filter(function(item) {
                  return item.id == data[i].id
              })[0];
          if(item){
            let index = this.dataset.map(function(e) { return e.id; }).indexOf(data[i].id);
            this.dataset.splice(index,1);
          }
          
          tempDataset.push({
            id: data[i].id,
            folio: folio,
            tickOrderDate: data[i].tick_order_date,
            nroPedido: data[i].tick_order_code,
            nro_ticket: data[i].tick_tkt_code,
            ticket: ticket,	          
            tkt_date: data[i].tick_tkt_date,
            cliente: data[i].cliente,
            obra: data[i].obra,
            driver_code: data[i].tick_driv_empl_code,
            driver: data[i].driver,
            ship_plant_code: data[i].tick_ship_plant_code,
            ship_plant_loc: data[i].tick_ship_plant_loc_code + "-" + data[i].tick_ship_plant_code,
            cod_camion: data[i].tick_truck_code,
            patente: data[i].lic_num,
            typed_time: data[i].tick_typed_time,
            proj_code: data[i].tick_proj_code,
            delv_addr: data[i].tick_delv_addr,
            estado: data[i].guiaEstado,
            num_sello: data[i].numero_sello,
            prod_code: prd,
            delv_qty: m3,
            fecha_creacion: data[i].fechaCreacion
          });
        }
      }
      
      this.spinner.hide('sp6');
      this.dataviewObj.refresh();
      
	  });

	  return tempDataset;

  }

  onCellClicked(e, args) {
    this.dataviewObj.refresh();
  }

  onChangeCentro(centro){
    console.log(centro.length == 0);
    if(centro.length != 0) {
      this.spinner.show('sp6'); 
      let fecha_comienzo = new Date();
      let fecha_final = new Date();
      fecha_comienzo.setHours(fecha_comienzo.getHours()-this.lastTime);
      let t_inicio = {hour:  fecha_comienzo.getHours(), minute: fecha_comienzo.getMinutes()};
      let t_final = {hour:  fecha_final.getHours(), minute: fecha_final.getMinutes()};

      let dia = 0;
      if(fecha_final.getHours()<this.lastTime) dia = 1;
      this.dataset = this.llenarGrillaHoras(dia,t_inicio,t_final);
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

    /*console.log(this.fromDate);
    if(!this.toDate)
      console.log("Mas nulo q la chucha");
    else console.log(this.toDate);*/
    if(this.toDate) this.isFilterHour = false;

    this.renderer.setProperty(this.myRangeInput.nativeElement, 'value', parsed);
  }

  filtroRangDate(){
    
    if(this.fromDate && this.toDate == null){
      //console.log("Servicio 1")
      let fecha_inicio = this.fromDate.year + "-" 
      + this.fromDate.month + "-" +this.fromDate.day

      //console.log(fecha_inicio)

      this.spinner.show('sp6');
      this.dataset = this.llenarGrillaRangoFecha(fecha_inicio,fecha_inicio,
        "00:00","23:59");
      //this.llenarGrillaRangoFecha(fecha_inicio,null);
    }
    if(this.fromDate && this.toDate){
      //console.log("Servicio 2")
      let fecha_inicio = this.fromDate.year + "-" 
      + this.fromDate.month + "-" +this.fromDate.day
      let fecha_final = this.toDate.year + "-" 
      + this.toDate.month + "-" +this.toDate.day

      /*console.log(fecha_inicio)
      console.log(fecha_final)*/

      this.spinner.show('sp6');
      this.dataset = this.llenarGrillaRangoFecha(fecha_inicio,fecha_final,
        "00:00","23:59");
      //this.llenarGrillaRangoFecha(fecha_inicio,fecha_final);
    }
    
  }

  showHoras(){
    this.isFilterHour = !this.isFilterHour
  }

  filtroHora(){
    //let dia = 0
    let fecha_inicio = null;
    let fecha_final = null;
    let t_inicio = this.startTime.hour+":"+this.startTime.minute;
    let t_final = this.endTime.hour+":"+this.endTime.minute;

    if(this.startTime.hour > this.endTime.hour){
      fecha_inicio = this.fromDate.year + "-" + this.fromDate.month + "-" + 
      (this.fromDate.day-1)
      fecha_final = this.fromDate.year + "-" +this.fromDate.month + "-" + 
      this.fromDate.day
    }
      //dia=1    
    else if(this.startTime.hour == this.endTime.hour &&
      this.startTime.minute <= this.endTime.minute){
      fecha_inicio = this.fromDate.year + "-" +this.fromDate.month + "-" +
      (this.fromDate.day-1)
      fecha_final = this.fromDate.year + "-" +this.fromDate.month + "-" + 
      this.fromDate.day
    }
    else {
      fecha_inicio = this.fromDate.year + "-" +this.fromDate.month + "-" + 
      this.fromDate.day
      fecha_final = this.fromDate.year + "-" +this.fromDate.month + "-" + 
      this.fromDate.day
    }


    //console.log(fecha_inicio)
    this.spinner.show('sp6');
    this.dataset = this.llenarGrillaRangoFecha(fecha_inicio,fecha_final,t_inicio,t_final);
    //this.dataset = this.llenarGrillaHoras(dia,t_inicio,t_final);*/
  }

  llenarGrillaHoras(dia,t_inicio,t_final){
    const tempDataset = [];

    this.guiaService.getAllGuiaByHoras(dia,t_inicio,t_final,
      this.centro).subscribe((data: any[])=>{ 
      if(data){
        for (let i = 0; i < data.length; i++) {

          var folio = null
          let prd = null, m3 = null
          
          if(data[i].folio_sii || data[i].folio_sii !=='') folio = data[i].folio_sii
          else folio = '--'

          if(data[i].guiaDetalle && data[i].guiaDetalle.length > 0 && data[i].guiaDetalle[0].prod_code != null) 
              prd = data[i].guiaDetalle[0].prod_code
          else prd = '--'

          if(data[i].guiaDetalle && data[i].guiaDetalle.length > 0 && data[i].guiaDetalle[0].delv_qty != null) 
              m3 = data[i].guiaDetalle[0].delv_qty
          else m3 = '--'

          let ticket = data[i].tick_order_date + '-' + data[i].tick_order_code+ '-' + 
          data[i].tick_tkt_code;
          let nroPedido = data[i].tick_order_date + '-' + data[i].tick_order_code;


          //if(data[i].guiaEstado.estado == "EMITIDA_SII"){
          if(data[i].guiaEstado.id > 4 && data[i] .guiaEstado.id < 11){
            let fecha = this.datepipe.transform(data[i].fechaCreacion, 'yyyy-MM-dd')
            if(this.isIEOrEdge){
              let fileURL = this.guiaService.getGuiaPDFString(data[i].folio_sii,
              fecha);
              this.urls_PDF.push({id:data[i].id , url_pdf: fileURL});
            }
            else{
              this.guiaService.getGuiaPDFByTicket(data[i].folio_sii,
                fecha).subscribe((result: any)=>{
                
                //console.log(result);
                var fileURL = URL.createObjectURL(result);
                //console.log(fileURL);
                this.urls_PDF.push({id:data[i].id , url_pdf: fileURL})
               
              });
            }
            
          }

          var item = this.dataset.filter(function(item) {
                  return item.id == data[i].id
              })[0];
          if(item){
            let index = this.dataset.map(function(e) { return e.id; }).indexOf(data[i].id);
            this.dataset.splice(index,1);
          }

          tempDataset.push({
            id: data[i].id,
            folio: folio,
            tickOrderDate: data[i].tick_order_date,
            nroPedido: data[i].tick_order_code,
            nro_ticket: data[i].tick_tkt_code,
            ticket: ticket,           
            tkt_date: data[i].tick_tkt_date,
            cliente: data[i].cliente,
            obra: data[i].obra,
            driver_code: data[i].tick_driv_empl_code,
            driver: data[i].driver,
            ship_plant_code: data[i].tick_ship_plant_code,
            ship_plant_loc: data[i].tick_ship_plant_loc_code + "-" + data[i].tick_ship_plant_code,
            cod_camion: data[i].tick_truck_code,
            patente: data[i].lic_num,
            typed_time: data[i].tick_typed_time,
            proj_code: data[i].tick_proj_code,
            delv_addr: data[i].tick_delv_addr,
            estado: data[i].guiaEstado,
            num_sello: data[i].numero_sello,
            prod_code: prd,
            delv_qty: m3,
            fecha_creacion: data[i].fechaCreacion
          });
        }
      }
     
      this.spinner.hide('sp6');
      this.dataviewObj.refresh();
      
    })

    return tempDataset;

  }

  llenarGrillaRangoFecha(fecha_inicio,fecha_final,t_inicio,t_final){
    const tempDataset = [];

    this.guiaService.getAllGuiaByRangeDate(fecha_inicio,fecha_final,
      t_inicio,t_final,this.centro).subscribe((data: any[])=>{ 
      if(data){
        for (let i = 0; i < data.length; i++) {

          var folio = null
          var prd = null, m3 = null
          
          if(data[i].folio_sii || data[i].folio_sii !=='') folio = data[i].folio_sii
          else folio = '--'

          if(data[i].guiaDetalle && data[i].guiaDetalle.length > 0 && data[i].guiaDetalle[0].prod_code != null) 
              prd = data[i].guiaDetalle[0].prod_code
          else prd = '--'

          if(data[i].guiaDetalle && data[i].guiaDetalle.length > 0 && data[i].guiaDetalle[0].delv_qty != null) 
              m3 = data[i].guiaDetalle[0].delv_qty
          else m3 = '--'

          let ticket = data[i].tick_order_date + '-' + data[i].tick_order_code+ '-' + 
          data[i].tick_tkt_code;
          let nroPedido = data[i].tick_order_date + '-' + data[i].tick_order_code;


          //if(data[i].guiaEstado.estado == "EMITIDA_SII"){
          if(data[i].guiaEstado.id > 4 && data[i] .guiaEstado.id < 11){
            let fecha = this.datepipe.transform(data[i].fechaCreacion, 'yyyy-MM-dd')
            if(this.isIEOrEdge){
              let fileURL = this.guiaService.getGuiaPDFString(data[i].folio_sii,
              fecha);
              this.urls_PDF.push({id:data[i].id , url_pdf: fileURL});
            }
            else{
              this.guiaService.getGuiaPDFByTicket(data[i].folio_sii,
                fecha).subscribe((result: any)=>{
                
                //console.log(result);
                var fileURL = URL.createObjectURL(result);
                //console.log(fileURL);
                this.urls_PDF.push({id:data[i].id , url_pdf: fileURL})
               
              });
            }
            
          }

          var item = this.dataset.filter(function(item) {
                  return item.id == data[i].id
              })[0];
          if(item){
            let index = this.dataset.map(function(e) { return e.id; }).indexOf(data[i].id);
            this.dataset.splice(index,1);
          }

          tempDataset.push({
            id: data[i].id,
            folio: folio,
            tickOrderDate: data[i].tick_order_date,
            nroPedido: data[i].tick_order_code,
            nro_ticket: data[i].tick_tkt_code,
            ticket: ticket,           
            tkt_date: data[i].tick_tkt_date,
            cliente: data[i].cliente,
            obra: data[i].obra,
            driver_code: data[i].tick_driv_empl_code,
            driver: data[i].driver,
            ship_plant_code: data[i].tick_ship_plant_code,
            ship_plant_loc: data[i].tick_ship_plant_loc_code + "-" + data[i].tick_ship_plant_code,
            cod_camion: data[i].tick_truck_code,
            patente: data[i].lic_num,
            typed_time: data[i].tick_typed_time,
            proj_code: data[i].tick_proj_code,
            delv_addr: data[i].tick_delv_addr,
            estado: data[i].guiaEstado,
            num_sello: data[i].numero_sello,
            prod_code: prd,
            delv_qty: m3,
            fecha_creacion: data[i].fechaCreacion
          });
        }
      }
     
      this.spinner.hide('sp6');
      this.dataviewObj.refresh();
      
    })

    return tempDataset;

  }

  checkEstado(){
    this.dataset.map(function(guia) { 

      if(guia.estado.id === 1 || guia.estado.id === 11
        || guia.estado.id === 12){
        console.log(guia.id)
      }
    })
  }

  selectOptionMenu(content,opcion){
    this.modalContent = this.guiaSelected
    const guia_id = this.guiaSelected.id;
    if(opcion === 'Emitir'){

      //console.log(this.guiaSelected.ship_plant_code)
      this.parametroService.getParametroByName(this.guiaSelected.ship_plant_code
        ,'Sello Requerido').subscribe((data: any[])=>{

        if(data) this.flagSelloRequerido = data;

        if(this.modalContent.num_sello){
          this.emitirForm.value.nroSello = this.modalContent.num_sello
          this.flagSelloRequerido = false;
        }
      });

      this.modalReference =this.modalService.open(content, {size: 'lg'})
      $("#contextMenu").hide();
    }
    else if(opcion === 'Ingresar Sello' || opcion === 'Confirmar'){

      //console.log(this.guiaSelected.ship_plant_code)
      this.parametroService.getParametroByName(this.guiaSelected.ship_plant_code
        ,'Sello Requerido').subscribe((data: any[])=>{

        if(data!=null) this.flagSelloRequerido = data;

        if(this.modalContent.num_sello){
          this.emitirForm.value.nroSello = this.modalContent.num_sello
          this.flagSelloRequerido = false;
        }
      });

      this.modalReference =this.modalService.open(content, {size: 'lg'})
      $("#contextMenu").hide();
    }
    else if(opcion === 'Ver Historial'){

      this.spinner.show('sp6'); 
      this.columnDefinitionsHistorial = [
        {
          id: 'fecha', name: 'Fecha', field: 'fecha', 
          minWidth: 10, width: 25,
          selectable: true,
          sortable: true,
          type: FieldType.date,
          formatter: Formatters.dateTimeIso
        },
        {
          id: 'usuario', name: 'Usuario', field: 'usuario', 
          minWidth: 20, width: 45,
          selectable: true,
          sortable: true,
          type: FieldType.string
        },
        {
          id: 'observacion', name: 'Observación', field: 'observacion',
          sortable: true, 
          minWidth: 30, width: 50,
          exportWithFormatter: true,
          type: FieldType.string
        },
        {
          id: 'estado', name: 'Estado', field: 'estado', 
          minWidth: 10, width: 30,
          selectable: true,
          sortable: true,
          type: FieldType.string,
          formatter: EstadoFormatter
        }
      ];

      this.gridOptionsHistorial = {
      
        enableCellNavigation: true,
        enableExcelCopyBuffer: true,
        enableFiltering: true,
        enableGridMenu: false,
        enableRowSelection: true
      };

      this.datasetHistorial = this.llenarHistorial(guia_id);

      this.modalReference =this.modalService.open(content, {size: <any>'xl'});

      $("#contextMenu").hide();
    }
    else if(opcion === 'Ver Guia Electrónica'){

      //if(this.guiaSelected.estado.estado == "EMITIDA_SII"){
      if(this.guiaSelected.estado.id > 4 && this.guiaSelected.estado.id <11){
        var item = this.urls_PDF.filter(function(item) {
          return item.id == guia_id
      })[0];
        this.guiaPDF = this.sanitizer.bypassSecurityTrustResourceUrl(
          item.url_pdf+'#zoom=130');
        //this.guiaPDF= this.sanitizer.bypassSecurityTrustResourceUrl("http://192.168.0.136:8080/api/guiasPDF/cliente/2019-08-08/1877015")
        /*let re = ".pdf"; 
        console.log(item.url_pdf)
        let newString = item.url_pdf.replace(re, "-Cedible.pdf");
        console.log(newString)*/
        let fecha = this.datepipe.transform(this.guiaSelected.fecha_creacion, 'yyyy-MM-dd')
        //console.log(this.modalContent)
        let file_url_cedible = null
        if(this.isIEOrEdge){
          file_url_cedible = this.guiaService.getGuiaPDFCedibleString(
            this.modalContent.folio,fecha);
          this.url_pdf_cedible = this.sanitizer.bypassSecurityTrustResourceUrl(
          file_url_cedible+'#zoom=130');
        }
        else{
          this.guiaService.getGuiaPDFCedible(this.modalContent.folio,
            fecha).subscribe((result: any)=>{
            
            file_url_cedible = URL.createObjectURL(result);
            this.url_pdf_cedible = this.sanitizer.bypassSecurityTrustResourceUrl(
            file_url_cedible+'#zoom=130');
            
          });
        }

        this.toggle = true;

        this.embedURL = this.guiaPDF;
      }
      this.modalReference =this.modalService.open(content,{size:<any>'xl', windowClass:"myCustomModalClass"})
      $("#contextMenu").hide();
    }
    else if(opcion === 'Anular'){

      this.modalReference =this.modalService.open(content)
      $("#contextMenu").hide();
    }
    else if(opcion === 'Cancelar'){

      this.spinner.show('sp6'); 
      this.columnDefinitionsHistorial = [
        {
          id: 'fecha', name: 'Fecha', field: 'fecha', 
          minWidth: 10, width: 25,
          selectable: true,
          filterable: true, sortable: true,
          type: FieldType.date,
          formatter: Formatters.dateTimeIso
        },
        {
          id: 'usuario', name: 'Usuario', field: 'usuario', 
          minWidth: 20, width: 45,
          selectable: true,
          filterable: true, sortable: true,
          type: FieldType.string
        },
        {
          id: 'observacion', name: 'Observación', field: 'observacion',
          sortable: true, 
          minWidth: 30, width: 50,
          exportWithFormatter: true,
          type: FieldType.string,
          filterable: true
        },
        {
          id: 'estado', name: 'Estado', field: 'estado', 
          minWidth: 10, width: 30,
          selectable: true,
          filterable: true, sortable: true,
          type: FieldType.string,
          formatter: EstadoFormatter
        }
      ];

      this.gridOptionsHistorial = {
      
        enableCellNavigation: true,
        enableExcelCopyBuffer: true,
        enableFiltering: true,
        enableGridMenu: false,
        enableRowSelection: true
      };

      this.datasetHistorial = this.llenarHistorial(guia_id);

      this.modalReference =this.modalService.open(content, {size: <any>'xl'});
      $("#contextMenu").hide();
    }    
  }

  llenarHistorial(id:number): any[] {
    const tempDataset = [];

    this.guiaService.getAllGuiaHistorial(id).subscribe((data: any[])=>{ 

      if(data){
        for (let i = 0; i < data.length; i++) {

            tempDataset.push({
              id: data[i].id,
              fecha: data[i].fecha,
              usuario: data[i].usuario,
              observacion: data[i].observacion,
              estado: data[i].guiaEstado
            });
        }
      }

      this.dataviewObjHistorial.refresh();
      this.spinner.hide('sp6');
  })

    return tempDataset;

  }

  checkRoleAnular(){
    if(this.modOption.length > 0 && (this.modOption.includes("Todas") || 
        this.modOption.includes("Anular"))){
    //if(this.modOption.length > 0 && this.modOption.includes("Anular")){
      /*if(this.modOption.includes("Todas") || 
        this.modOption.includes("Anular"))*/
      return true; 
    }
    else return false
  }

  anularGuia(anularData,id){

    //Se actualiza el estado de la guia.
    this.spinner.show('sp6'); 
    this.guiaService.actualizarEstadoGuia(id,anularData.razones,"ANULADA",
      this.token.getName()).subscribe((data: any)=>{
      //this.spinner.show('sp6'); 
      
      /*let fecha_comienzo = new Date();
      let fecha_final = new Date();
      fecha_comienzo.setHours(fecha_comienzo.getHours()-12);
      let t_inicio = {hour:  fecha_comienzo.getHours(), minute: fecha_comienzo.getMinutes()};
      let t_final = {hour:  fecha_final.getHours(), minute: fecha_final.getMinutes()};

      let dia = 0;
      if(fecha_final.getHours()<12) dia = 1;
      this.dataset = this.llenarGrillaHoras(dia,t_inicio,t_final);

      this.dataviewObj.refresh();*/

      this.anularForm.patchValue({
        razones: [null, Validators.required]
      });
      
      this.modalReference.close();
      this.spinner.hide('sp6');
    });    
  }

  guardarGuia(emitirData,id){

    this.spinner.show('sp6'); 
    this.guiaService.actualizarGuia(id,emitirData.nroSello, 
      this.token.getName()).subscribe((data: any)=>{
        //this.spinner.show('sp6'); 

        //this.angularGrid.dataView.refresh();
        this.modalReference.close();
      });
    /*let guia_id = this.guiaSelected.id

    var item = this.dataset.filter(function(item) {
                  return item.id == guia_id
              })[0];
              
    if(item){
      
      
      let index = this.dataset.map(function(e) { return e.id; }).indexOf(guia_id);

      var row = this.dataviewObj.getItem(index);

      this.dataset[index].num_sello = emitirData.nroSello

      this.gridObj.invalidateRow(index);
      this.gridObj.render();
     
    }
    this.modalReference.close();*/
  }

  emitirGuia(emitirData,id){
    
    if (confirm('Estas seguro?')){

      this.spinner.show('sp6'); 
      this.guiaService.actualizarGuiaEmitida(id,emitirData.nroSello, 
      this.token.getName()).subscribe((data: any)=>{

        //this.spinner.show('sp6'); 
            
        /*let fecha_comienzo = new Date();
        let fecha_final = new Date();
        fecha_comienzo.setHours(fecha_comienzo.getHours()-12);
        let t_inicio = {hour:  fecha_comienzo.getHours(), minute: fecha_comienzo.getMinutes()};
        let t_final = {hour:  fecha_final.getHours(), minute: fecha_final.getMinutes()};

        let dia = 0;
        if(fecha_final.getHours()<12) dia = 1;
        this.dataset = this.llenarGrillaHoras(dia,t_inicio,t_final);

        this.dataviewObj.refresh();*/

        this.emitirForm.patchValue({
          nroSello: null
        });
        //this.angularGrid.dataView.refresh();
        //this.guiaService.emitirGuia(id).subscribe((data: any)=>{});
        this.modalReference.close();
      
        /*this.guiaService.actualizarEstadoGuia(id,null,"SOL_EMISION",
          this.token.getName()).subscribe((data: any)=>{
            this.spinner.show('sp6'); 
            
            let fecha_comienzo = new Date();
            let fecha_final = new Date();
            fecha_comienzo.setHours(fecha_comienzo.getHours()-12);
            let t_inicio = {hour:  fecha_comienzo.getHours(), minute: fecha_comienzo.getMinutes()};
            let t_final = {hour:  fecha_final.getHours(), minute: fecha_final.getMinutes()};

            let dia = 0;
            if(fecha_final.getHours()<12) dia = 1;
            this.dataset = this.llenarGrillaHoras(dia,t_inicio,t_final);

            this.dataviewObj.refresh();

            this.emitirForm.patchValue({
              nroSello: null
            });
            //this.angularGrid.dataView.refresh();
            //this.guiaService.emitirGuia(id).subscribe((data: any)=>{});
            this.modalReference.close();
        })*/
      })
    }
    else this.modalReference.close();
  }

  checkRoleCancelar(){
    if(this.modOption.length > 0 && (this.modOption.includes("Todas") || 
        this.modOption.includes("Cancelar"))){
    //if(this.modOption.length > 0 && this.modOption.includes("Cancelar")){
      /*if(this.modOption.includes("Todas") || 
        this.modOption.includes("Anular"))*/
      return true; 
    }
    else return false
  }

  cancelarSolicitud(cancelarData,id){
    //Se debe hacer el llamado a IConstruye.

    //Se actualiza el estado de la guia.
    this.spinner.show('sp6'); 
    this.guiaService.actualizarEstadoGuia(id,cancelarData.razones,"CANCELADA",
      this.token.getName()).subscribe((data: any)=>{
        //this.spinner.show('sp6'); 
        
        /*let fecha_comienzo = new Date();
        let fecha_final = new Date();
        fecha_comienzo.setHours(fecha_comienzo.getHours()-12);
        let t_inicio = {hour:  fecha_comienzo.getHours(), minute: fecha_comienzo.getMinutes()};
        let t_final = {hour:  fecha_final.getHours(), minute: fecha_final.getMinutes()};

        let dia = 0;
        if(fecha_final.getHours()<12) dia = 1;
        this.dataset = this.llenarGrillaHoras(dia,t_inicio,t_final);

        this.dataviewObj.refresh();*/


        this.cancelarForm.patchValue({
          razones: [null, Validators.required]
        });
        //this.angularGrid.dataView.refresh();
        this.modalReference.close();
    });
  }

  changeSello(sello){

    if(sello==''){
      this.flagSelloRequerido = true;
    }
    else this.flagSelloRequerido = false;
  }

  onChangeSrc(guia) {
    if(guia === 'cedible') {
      this.toggle = false;
      this.electronica = false;
      this.cedible = true;
      //console.log(this.url_pdf_cedible)
      this.embedURL = this.url_pdf_cedible
    }
    else if (guia === 'electronica') {
      this.toggle = true;
      this.electronica = true;
      this.cedible = false;
      this.embedURL = this.guiaPDF
    }
    //console.log(this.embedURL)
  }

}
