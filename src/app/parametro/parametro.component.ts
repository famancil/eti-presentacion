import { Component, Injectable, OnInit, OnDestroy } from '@angular/core';
import {
  AngularGridInstance,
  AngularUtilService,
  Aggregators,
  Column,
  DelimiterType,
  Editors,
  FieldType,
  FileType,
  Filters,
  Formatters,
  GridOption,
  GridService,
  Grouping,
  GroupTotalFormatters,
  OnEventArgs,
  SortDirectionNumber,
  Sorters,
} from 'angular-slickgrid'
import { FormBuilder } from '@angular/forms';
import { ParametroService } from '../parametro.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-parametro',
  templateUrl: './parametro.component.html',
  styleUrls: ['./parametro.component.css']
})
export class ParametroComponent implements OnInit {

  title = 'Configuración';

  //Grilla Angular 
  angularGrid: AngularGridInstance;
  angularGrid2: AngularGridInstance;
  columnDefinitions: Column[];
  columnDefinitions2: Column[];
  gridOptions: GridOption;
  gridOptions2: GridOption;
  gridService: GridService;
  dataset: any[];
  dataset2: any[];
  dataset2Aux: any[];
  gridObj: any;
  gridObj2: any;
  dataviewObj: any;
  dataviewObj2: any;  

  titleFirstGrid: any = 'Parametros';
  titleSecondGrid: any = 'Excepciones';
  alertWarning: any;

  saveTemp: any;
  filters: any[];

  //Nueva Excepción
  arrayCodCentro: any[];
  selectedCodCentro: any;
  arrayCodPlanta: any[];
  selectedCodPlanta: any;
  //arrayCategoria: any[];
  selectedCategoria: any;
  selectedId: any;
  //arrayParametro: any[];
  selectedParametro: any;
  inputValor: any;
  selectedObjects: any;
  excepcionForm;
  flagCreate: any;

  //Modal
  closeResult: string;
  modalReference: any;
  buttonVisible = false;


  constructor(private angularUtilService: 
    AngularUtilService, private parametroService: ParametroService, 
    private modalService: NgbModal, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService) { 
    this.excepcionForm = this.formBuilder.group({
      cod_centro: null,
      cod_planta: null,
      valor: null
    });    
  }

  ngOnInit() {
    this.showSpinner('sp6');
    this.columnDefinitions = [
      {
        id: 'categoria', name: 'Categoria', field:'',
        width: 20,
        minWidth: 20,
        //filterable: true,
        sortable: true
      },
      {
        id: 'parametro', name: 'Parametro', field: 'parametro',
        width: 50,
        minWidth: 50,
        filterable: true,
        /*type: FieldType.string,
        editor: {
          model: Editors.longText
        },*/
        sortable: true
      },
      {
        id: 'valor', name: 'Valor', field: 'valor',
        minWidth: 50, width: 60,
        filterable: true,
        type: FieldType.string,
        sortable: true,
        editor: {
          model: Editors.longText
        },
        //params: { groupFormatterPrefix: 'Total: ' }
      }
      /*{
        id: 'cod_centro', name: 'Centro', field: 'cod_centro',
        width: 80,
        maxWidth: 100,
        filterable: true,
        sortable: true,
        groupTotalsFormatter: GroupTotalFormatters.sumTotals,
        params: { groupFormatterPrefix: 'Total: ' }
      },
      {
        id: 'cod_planta', name: 'Planta', field: 'cod_planta',
        width: 80,
        maxWidth: 100,
        filterable: true,
        sortable: true,
        groupTotalsFormatter: GroupTotalFormatters.sumTotals,
        params: { groupFormatterPrefix: 'Total: ' }
      }*/
      
    ];

    this.columnDefinitions2 = [
      /*{
        id: 'parametro', name: 'Parametro', field: '',
        width: 50,
        minWidth: 50,
        filterable: true,
        type: FieldType.string,
        editor: {
          model: Editors.longText
        },
        sortable: true
      },*/
      {
        id: 'cod_centro', name: 'Centro', field: 'cod_centro',
        width: 80,
        maxWidth: 100,
        filterable: true,
        sortable: true,
        groupTotalsFormatter: GroupTotalFormatters.sumTotals,
        params: { groupFormatterPrefix: 'Total: ' }
      },
      {
        id: 'cod_planta', name: 'Planta', field: 'cod_planta',
        width: 80,
        maxWidth: 100,
        filterable: true,
        sortable: true,
        groupTotalsFormatter: GroupTotalFormatters.sumTotals,
        params: { groupFormatterPrefix: 'Total: ' }
      },
      {
        id: 'valor', name: 'Valor', field: 'valor',
        minWidth: 50, width: 60,
        filterable: true,
        type: FieldType.string,
        sortable: true,
        editor: {
          model: Editors.longText
        },
        params: { groupFormatterPrefix: 'Total: ' }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext.id);
          if (confirm('Estas seguro?')) {
            this.parametroService.deleteParametro(args.dataContext.id).subscribe((res)=>{
              //window.alert("Parametro "+ res.parametro +" de la Categoria "+ res.categoria+" Actualizado");
              this.angularGrid2.gridService.deleteDataGridItemById(args.dataContext.id);
              },
            error => {
              //this.dataView.beginUpdate();
              this.gridObj.invalidate();
            });
            
          }
        }
      },
      
      
    ];

    this.gridOptions = {
      enableCellNavigation: true,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      enableFiltering: true,
      enableGrouping: true,
      editable: true,
      exportOptions: {
        sanitizeDataExport: true
      },
      gridMenu: {
        hideExportTextDelimitedCommand: false
      },
      enableGridMenu: false,
      enableCheckboxSelector: true,
      enableRowSelection: true,
      checkboxSelector: {
        hideSelectAllCheckbox: true
      }
    };

    this.gridOptions2 = {
      enableCellNavigation: true,
      autoResize: {
        containerId: 'demo-container-2',
        sidePadding: 15
      },
      enableFiltering: true,
      enableGrouping: true,
      editable: true,
      exportOptions: {
        sanitizeDataExport: true
      },
      gridMenu: {
        hideExportTextDelimitedCommand: false
      }
    };

    //this.loadData(500);
    this.dataset = [];
   
    //Temp
    //this.dataset = this.parametroService.getParametrosExceptExcepcion();
    this.parametroService.getParametrosExceptExcepcion().subscribe((data: any[])=>{    
      this.dataset = data;

      //this.arrayCategoria = [];

      /*for(let i=0; i<data.length;i++){
        if(!this.arrayCategoria.includes(data[i].categoria))
          this.arrayCategoria.push(data[i].categoria)
      }*/

      //console.log(this.dataset)    
    });

    this.dataset2 = [];
    this.dataset2Aux = [];

    this.arrayCodCentro = [];
    
    this.parametroService.getAllCodCentro().subscribe((data: any[])=>{    
      this.arrayCodCentro = data;   
      //console.log(this.arrayCodCentro) 
    });
    
    //this.dataset2 = this.parametroService.getParametrosByCategoryExcepcion();
    
    //Descomentar
    /*this.parametroService.getParametrosByCategoryExcepcion().subscribe((data: any[])=>{    
      this.dataset2 = data;    
    });*/

  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
    this.dataviewObj = angularGrid.dataView;
    this.gridService = angularGrid.gridService;
    this.groupByCategory();
    //this.collapseAllGroups();
  }
  angularGridReady2(angularGrid2: AngularGridInstance) {
    this.angularGrid2 = angularGrid2;
    this.gridObj2 = angularGrid2.slickGrid;
    this.dataviewObj2 = angularGrid2.dataView;
    //this.groupByParametro();
  }

  clearGrouping() {
    this.dataviewObj.setGrouping([]);
    this.dataviewObj2.setGrouping([]);
  }

  collapseAllGroups() {
    this.dataviewObj.collapseAllGroups();
    this.dataviewObj2.collapseAllGroups();
  }

  expandAllGroups() {
    this.dataviewObj.expandAllGroups();
    this.dataviewObj2.expandAllGroups();
  }


  /*groupByCentro() {
    
    this.dataviewObj2.setGrouping([
    {
      getter: 'cod_centro',
      formatter: (g) => `Centro: ${g.value} <span style="color:green">(${g.count} items)</span>`,
      comparer: (a, b) => Sorters.numeric(a.value, b.value, SortDirectionNumber.asc),
      collapsed: true,
      lazyTotalsCalculation: true
    },
    {
        getter: 'parametro',
        formatter: (g) => `${g.value}  <span style="color:green">(${g.count} items)</span>`,
        collapsed: true
      }
    ] as Grouping[]);

  }

  groupByPlanta() {
    this.dataviewObj.setGrouping({
      getter: 'cod_planta',
      formatter: (g) => `Planta: ${g.value} <span style="color:green">(${g.count} items)</span>`,
      
      comparer: (a, b) => Sorters.numeric(a.value, b.value, SortDirectionNumber.asc),
      aggregateCollapsed: false
    } as Grouping);
    this.dataviewObj2.setGrouping({
      getter: 'cod_planta',
      formatter: (g) => `Planta: ${g.value} <span style="color:green">(${g.count} items)</span>`,
    
      comparer: (a, b) => Sorters.numeric(a.value, b.value, SortDirectionNumber.asc),
      aggregateCollapsed: false,
      lazyTotalsCalculation: true
    } as Grouping);
  }*/

  groupByCategory() {
    this.dataviewObj.setGrouping({
      getter: 'categoria',
      formatter: (g) => `${g.value} <span style="color:green">(${g.count} items)</span>`,
      comparer: (a, b) => Sorters.numeric(a.value, b.value, SortDirectionNumber.asc),
      collapsed:true
    } as Grouping);
  }

  groupByParametro() {
    this.dataviewObj2.setGrouping({
      getter: 'parametro',
      formatter: (g) => `${g.value} <span style="color:green">(${g.count} items)</span>`,
      comparer: (a, b) => Sorters.numeric(a.value, b.value, SortDirectionNumber.asc),
      collapsed: true
    } as Grouping);
  }

  /*groupByCenterOrderByCount(aggregateCollapsed) {
    this.dataviewObj.setGrouping({
      getter: 'cod_centro',
      formatter: (g) => `Centro: ${g.value} <span style="color:green">(${g.count} items)</span>`,
      comparer: (a, b) => {
        return a.count - b.count;
      },
      aggregateCollapsed,
      lazyTotalsCalculation: true
    } as Grouping);
  }*/

  /*groupByCategoryParams() {
    this.dataviewObj.setGrouping([
      {
        getter: 'categoria',
        formatter: (g) => `${g.value}  <span style="color:green">(${g.count} items)</span>`,
        comparer: (a, b) => {
          return a.count - b.count;
        },
        aggregateCollapsed: true,
        lazyTotalsCalculation: true
      },
      {
        getter: 'parametro',
        formatter: (g) => `${g.value}  <span style="color:green">(${g.count} items)</span>`,
        collapsed: true,
        lazyTotalsCalculation: true
      }
    ] as Grouping[]);

    this.dataviewObj2.setGrouping([
      {
        getter: 'categoria',
        formatter: (g) => `Categoria: ${g.value}  <span style="color:green">(${g.count} items)</span>`,
        comparer: (a, b) => {
          return a.count - b.count;
        },
        aggregateCollapsed: true,
        lazyTotalsCalculation: true
      },
      {
        getter: 'parametro',
        formatter: (g) => `Parametro: ${g.value}  <span style="color:green">(${g.count} items)</span>`,
        collapsed: true,
        lazyTotalsCalculation: true
      },
      {
      getter: 'cod_centro',
      formatter: (g) => `Centro: ${g.value} <span style="color:green">(${g.count} items)</span>`,
      comparer: (a, b) => Sorters.numeric(a.value, b.value, SortDirectionNumber.asc),
      collapsed: true,
      lazyTotalsCalculation: true
      } 
    ] as Grouping[]);
  }*/

  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log(metadata);

    //Para guardar el valor en caso de error.
    this.saveTemp = metadata.dataContext.valor;
    this.selectedParametro = metadata.dataContext.parametro;
    this.selectedId = metadata.dataContext.id;
    this.titleSecondGrid = metadata.dataContext.parametro;

    if(metadata.cell !== 0 && metadata.dataContext.excepcionable!==0) this.buttonVisible = true;
    else this.buttonVisible = false;

    this.parametroService.getParametrosExcepcion(metadata.dataContext.parametro).subscribe((data: any[])=>{    
        this.dataset2 = data;
        /*this.filters = [metadata.dataContext.parametro]
        this.dataset2 = this.dataset2.filter(x => this.filters.includes(x.parametro))
        this.dataset2.push(...this.dataset2Aux.filter(x => this.filters.includes(x.parametro)))*/
        //this.dataviewObj2.expandGroup(metadata.dataContext.parametro);    
      });
    /*if (metadata.dataContext.parametro === 'Minuto de espera'){
      //this.dataviewObj2.expandAllGroups();

      this.parametroService.getParametrosExcepcion().subscribe((data: any[])=>{    
        this.dataset2 = data;
        this.filters = ['Minuto de espera']
        this.dataset2 = this.dataset2.filter(x => this.filters.includes(x.parametro))
        this.dataset2.push(...this.dataset2Aux.filter(x => this.filters.includes(x.parametro)))
        this.dataviewObj2.expandGroup('Minuto de espera');    
      });
      //this.dataset2 = this.parametroService.getParametrosByCategoryExcepcion();
      
    }
    else if (metadata.dataContext.parametro === 'Impresora predeterminada'){
      //this.dataviewObj2.expandAllGroups();

      this.parametroService.getParametrosExcepcion().subscribe((data: any[])=>{    
        this.dataset2 = data;
        this.filters = ['Impresora predeterminada']
        this.dataset2 = this.dataset2.filter(x => this.filters.includes(x.parametro))
        this.dataset2.push(...this.dataset2Aux.filter(x => this.filters.includes(x.parametro)))
        this.dataviewObj2.expandGroup('Impresora predeterminada'); 
      });
      
    }
    else if (metadata.dataContext.parametro === 'Confirmar antes de solicitar'){
      //this.dataviewObj2.expandAllGroups();

      this.parametroService.getParametrosExcepcion().subscribe((data: any[])=>{    
        this.dataset2 = data;
        this.filters = ['Confirmar antes de solicitar']
        this.dataset2 = this.dataset2.filter(x => this.filters.includes(x.parametro))
        this.dataset2.push(...this.dataset2Aux.filter(x => this.filters.includes(x.parametro)))
        this.dataviewObj2.expandGroup('Impresora predeterminada'); 
      });

    }
    else this.dataset2 = [];*/
  }

  onCellClicked2(e, args) {
    const metadata = this.angularGrid2.gridService.getColumnFromEventArguments(args);
    /*if (metadata.dataContext.parametro === 'Minuto de espera'){
      this.dataviewObj2.expandAllGroups();
    }
    else this.dataviewObj2.collapseAllGroups();*/
  }

  onCellChanged(e, args) {
    /*this.parametroService.getParametrosExceptExcepcion().subscribe((data: any[])=>{    
      this.dataset = data;    
    },
    error => {
      //this.dataView.beginUpdate();
      args.item.valor = this.saveTemp;
      this.gridObj.invalidate();
    });*/
    //Debo descomentar
    
    this.parametroService.updateParametro(args.item).subscribe((res)=>{
      //window.alert("Parametro "+ res.parametro +" de la Categoria "+ res.categoria+" Actualizado");
    this.angularGrid.gridService.highlightRow(args.row, 86400000);
    },
    error => {
      //this.dataView.beginUpdate();
      args.item.valor = this.saveTemp;
      this.gridObj.invalidate();
    });
    /*var row = args.row
    args.grid.setHighlightedCells();
    this.gridObj.setCellCssStyles("valor_highlight", {
   row: {
        valor: "highlight", 
        parametro: "highlight" 
       }

})*/
  }

  onCellChanged2(e, args) {
    /*this.parametroService.getParametrosExceptExcepcion().subscribe((data: any[])=>{    
      this.dataset = data;    
    },
    error => {
      //this.dataView.beginUpdate();
      args.item.valor = this.saveTemp;
      this.gridObj.invalidate();
    });*/
    //Debo descomentar
    this.parametroService.updateParametro(args.item).subscribe((res)=>{
      this.angularGrid2.gridService.highlightRow(args.row, 86400000);
    },
    error => {
      //this.dataView.beginUpdate();
      args.item.valor = this.saveTemp;
      this.gridObj.invalidate();
    });
  }

  onChangeCentro(newValue) {
    this.parametroService.getAllCodPlantaByCodCentro(newValue).subscribe((data: any[])=>{    
      //this.arrayCodPlanta = data;   
      this.arrayCodPlanta = [];
      for(let i=0;i<data.length;i++){
        this.arrayCodPlanta.push(data[i][1])
      }
    });
    //this.selectedCodCentro = newValue;
    // ... do other stuff here ...
  }

  onChangePlanta(newValue) {
    //console.log(newValue);
    this.selectedCodPlanta = newValue;
    // ... do other stuff here ...
  }

  onChangeCategoria(newValue) {
    //console.log(newValue);
    this.selectedCategoria = newValue;
    /*this.arrayParametro = []
    for(let i=0; i<this.dataset.length;i++){
        
      if(!this.arrayParametro.includes(this.dataset[i].parametro) && 
        this.dataset[i].categoria === this.selectedCategoria){
        //this.selectedId = this.dataset[i].id;
        this.arrayParametro.push(this.dataset[i].parametro)
      }
    }*/
  }

  onChangeParametro(newValue) {
    //console.log(newValue);
    this.selectedParametro = newValue;
    for(let i=0; i<this.dataset.length;i++){
        
      if(this.dataset[i].parametro === this.selectedParametro){
        this.selectedId = this.dataset[i].id;
        break;
      }
    }
    // ... do other stuff here ...
  }

  /*onSelectedRowsChanged(e, args) {
    if (Array.isArray(args.rows)) {
      this.selectedObjects = args.rows.map(idx => {
        const item = this.gridObj.getDataItem(idx);
        console.log("item: ",item)
        return item.title || '';
      });
    }
  }*/

  /*addNewItem() {

    const newItem = {
      id: 0,
      cod_centro: this.selectedCodCentro,
      cod_planta: this.selectedCodPlanta,
      categoria: "Excepción",
      parametro: this.selectedParametro,
      valor: this.inputValor,
      activo: true,
      idParametroRef: this.selectedId
    };
    // add the item to the grid
    this.parametroService.createParametro(newItem).subscribe((res)=>{

          //this.dataset2.push(newItem);
          //this.dataset2Aux.push(newItem);

          this.angularGrid2.dataView.refresh();

          this.selectedCodCentro = null
          this.selectedCodPlanta = null
          this.selectedCategoria = null
          this.selectedParametro = null
          this.inputValor = null

          window.alert("Parametro "+ res.parametro +" de la Categoria "+ res.categoria+" creado con exito");
    });
    
  }*/

  onExcepcionSubmit(exceptionData){

    this.flagCreate = true;

    const newItem = {
      id: 0,
      cod_centro: exceptionData.cod_centro,
      cod_planta: exceptionData.cod_planta,
      categoria: "Excepción",
      parametro: this.selectedParametro,
      valor: exceptionData.valor,
      activo: true,
      idParametroRef: this.selectedId,
      excepcionable: 1
    };
    console.log(this.dataset2)
    for(let item of this.dataset2){
      //console.log(item)
      if(item.cod_centro === newItem.cod_centro && 
        item.cod_planta === newItem.cod_planta){
        this.flagCreate = false;
        break;
      }
    }

    // add the item to the grid
    if(this.flagCreate){
      this.parametroService.createParametro(newItem).subscribe((res)=>{

            this.dataset2.push(newItem);
            //this.dataset2Aux.push(newItem);

            this.angularGrid2.dataView.refresh();

            //this.excepcionForm.reset();
            this.excepcionForm.cod_centro = null;
            this.excepcionForm.cod_planta = null;
            this.excepcionForm.valor = null;
            this.selectedParametro = null
            this.selectedId = null          

            window.alert("Parametro "+ res.parametro +" de la Categoria "+ 
              res.categoria+" creado con exito");
      });
    }
    else window.alert("Excepción ya esta registrado");

    this.modalReference.close();
    //console.log(exceptionData)
  }

  open(content) {
    this.modalReference = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }

  showSpinner(name: string) {
    this.spinner.show(name); 
    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide(name);
    }, 5000);
  }


}
