import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import { GuiaService } from '../guia.service';
import { GuiaRepasoService } from '../guia-repaso.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {formatDate} from '@angular/common';
import { NgxSpinnerService } from "ngx-spinner";
import { TokenStorageService } from '../auth/token-storage.service';
import {DatePipe} from '@angular/common'
import { ParametroService } from '../parametro.service';


@Component({
  selector: 'app-guia-despacho-repasar',
  templateUrl: './guia-despacho-repasar.component.html',
  styleUrls: ['./guia-despacho-repasar.component.css']
})
export class GuiaDespachoRepasarComponent implements OnInit {

  //paramsURL
  id;
  nroGuiaDespacho;
  dataset: any[];
  datasetIds: any[];

  public imagePath;
  imgURL: any;
  public message: string;

  //checkYes: any;
  //checkNo: any;
  guiaPDF: any;
  guiaCedible: any;
  guiaEscaneada: any;
  embedURL: any;
  filename; any;

  //Busqueda de Folio
  search;
  toggle: any[] = [false,false,true];
  electronica = false;
  escaneada = true;
  cedible = false;

  validRut = true
  validTime: any[] = [true,true,true,true,true,true];
  checkTime

  rolesGrant;
  canRepasar = false;

  //Formulario
  repasarForm;
  folio=null;
  options = [
    {value: 1, id:"SI"},
    {value: null, id:"N/A"},
    {value: 0, id:"NO"},
  ]
  disabledAll = false;
  disabledAllTime = false;
  myDate = new Date();
  today;
  optionsFirmado = [
    {value: true, id:"Si"},
    {value: null, id:"n/a"},
    {value: false, id:"No"},
  ]
  optionsAdicAguaFirmado = [
    {value: true, id:"Si AdicAgua"},
    {value: null, id:"n/a AdicAgua"},
    {value: false, id:"No AdicAgua"},
  ]
  optionsAdicFirmado = [
    {value: true, id:"Si Adic"},
    {value: null, id:"n/a Adic"},
    {value: false, id:"No Adic"},
  ]
  optionsTipoAdicFirmado = [
    {value: true, id:"Si TipoAdic"},
    {value: null, id:"n/a TipoAdic"},
    {value: false, id:"No TipoAdic"},
  ]
  optionsCamionObraFirmado = [
    {value: true, id:"Si CamionObra"},
    {value: null, id:"n/a CamionObra"},
    {value: false, id:"No CamionObra"},
  ]
  optionsHormigonFirmado = [
    {value: true, id:"Si Hormigon"},
    {value: null, id:"n/a Hormigon"},
    {value: false, id:"No Hormigon"},
  ]
  nombreRequired=false;
  rutRequired=false;

  dataLocalUrl;

  name:string;

  laboratorios: any[]=[];
  aditivos: any[]=[];

  //Si esta en IE
  isIEOrEdge;


  constructor(private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private guiaService: GuiaService,
    public datepipe: DatePipe, 
    private guiaRepasoService: GuiaRepasoService,
    private parametroService: ParametroService,
    private router : Router,private spinner: NgxSpinnerService,
    private token: TokenStorageService) { 

    this.disabledAll = true;
    this.disabledAllTime = true;
    this.repasarForm = this.formBuilder.group({
      folios_ok: null,
      horaCarga: {hour: 9, minute: 0},
      salidaPlanta: {hour: 10, minute: 30},
      llegadaObra: {hour: 11, minute: 30},
      inicioDescarga: {hour: 13, minute: 30},
      salidaObra: {hour: 14, minute: 30},
      ingresoPlanta: {hour: 15, minute: 30},

      observaciones: null,
      solicitudNC: false,
      nombreCliente: null,
      rutCliente: null,
      //noFirmadoCliente: false,
      //firmadoCliente: [false, Validators.requiredTrue],
      firmadoCliente: [null, Validators.required],

      cantidadAdicAgua: null,
      solicitanteAdicAgua: null,
      firmadoAdicAgua: null,

      cantidadAdicAditivo: null,
      solicitanteAdic: null,
      firmadoAdicAditivo: null,

      selectedAdicAditivo: null,
      solicitanteTipoAditivo: null,
      firmadoTipoAditivo: null,

      selectedTipoAditivo: null,

      tiempoCamionObra:null,
      solicitanteCamionObra:null,
      firmadoCamionObra: null,      

      mCubicHormigon: null,
      solicitanteHormigon:null,
      firmadoHormigon: null,

      muestraPropia: false,
      muestraCliente: false,
      //nombreHormigon: null,

      /*cantidadBombeo: null,
      codBombeo: null,
      selectedProveedor: null,
      reportBombeo: null,*/
      selectedLaboratorio: null,
      numeroMuestra: null,
      asentamientoCono: null,
      //litroAditivo: null,
      
      //emailInterino: null,
      camionDevuelto: false,
    });
  }

  ngOnInit() {

    this.rolesGrant = this.token.getRoles();
    for(let i=0;i<this.rolesGrant.length;i++){

      //if(this.rolesGrant[i].mod_nombre === 'GuiaDespacho' &&
      if(this.rolesGrant[i].rol_name === 'Supervisor' ||
          this.rolesGrant[i].rol_name === 'Administrativo' ||
          this.rolesGrant[i].rol_name === 'Administrador'){
        this.canRepasar = true; 
      }
    }

    this.parametroService.getAllTipoAditivos().subscribe((data: any[])=>{

      if(data!=[]){
        
        for (let i = 0; i < data.length; i++)
          this.aditivos.push(data[i].valor);

      }

      console.log("Aditivos: ",this.aditivos);
    });

    this.parametroService.getAllLaboratorios().subscribe((data: any[])=>{

      if(data!=[]){
        
        for (let i = 0; i < data.length; i++)
          this.laboratorios.push(data[i].valor);

      }

      console.log("laboratorios: ",this.laboratorios);
    });

    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent)

    this.name = this.token.getName();
    this.spinner.show('sp6'); 
    let horaCargaTime = this.repasarForm.get('horaCarga').value
    let salidaPlantaTime = this.repasarForm.get('salidaPlanta').value
    let llegadaObraTime = this.repasarForm.get('llegadaObra').value
    let inicioDescargaTime = this.repasarForm.get('inicioDescarga').value
    let salidaObraTime = this.repasarForm.get('salidaObra').value
    let ingresoPlantaTime = this.repasarForm.get('ingresoPlanta').value
    
    if(horaCargaTime.hour == salidaPlantaTime.hour && 
      horaCargaTime.minute == salidaPlantaTime.minute || 
      horaCargaTime.hour == salidaPlantaTime.hour && 
      horaCargaTime.minute > salidaPlantaTime.minute ||
      horaCargaTime.hour > salidaPlantaTime.hour) this.disabledAllTime = false

    if(salidaPlantaTime.hour == llegadaObraTime.hour && 
      salidaPlantaTime.minute == llegadaObraTime.minute || 
      salidaPlantaTime.hour == llegadaObraTime.hour && 
      salidaPlantaTime.minute > llegadaObraTime.minute ||
      salidaPlantaTime.hour > llegadaObraTime.hour) this.disabledAllTime = false

    if(llegadaObraTime.hour == inicioDescargaTime.hour && 
      llegadaObraTime.minute == inicioDescargaTime.minute || 
      llegadaObraTime.hour == inicioDescargaTime.hour && 
      llegadaObraTime.minute > inicioDescargaTime.minute ||
      llegadaObraTime.hour > inicioDescargaTime.hour) this.disabledAllTime = false

    if(inicioDescargaTime.hour == salidaObraTime.hour && 
      inicioDescargaTime.minute == salidaObraTime.minute || 
      inicioDescargaTime.hour == salidaObraTime.hour && 
      inicioDescargaTime.minute > salidaObraTime.minute ||
      inicioDescargaTime.hour > salidaObraTime.hour) this.disabledAllTime = false

    if(salidaObraTime.hour == ingresoPlantaTime.hour && 
      salidaObraTime.minute == ingresoPlantaTime.minute || 
      salidaObraTime.hour == ingresoPlantaTime.hour && 
      salidaObraTime.minute > ingresoPlantaTime.minute ||
      salidaObraTime.hour > ingresoPlantaTime.hour) this.disabledAllTime = false


    this.today = formatDate(this.myDate, 'yyyy/MM/dd', 'en');
    this.id = this.route.snapshot.paramMap.get('id');
    this.repasarForm.get('selectedAdicAditivo').disable();
    //this.repasarForm.get('selectedProveedor').disable();
    this.repasarForm.get('selectedLaboratorio').disable();
    this.repasarForm.get('selectedTipoAditivo').disable();
    /*this.datasetIds = JSON.parse(localStorage.getItem('datasetIds'))
    this.nroGuiaDespacho = localStorage.getItem('nroGuiaDespacho')*/
    //console.log(this.id)
    //this.checkYes = false;
    //this.checkNo = false;

    //this.embedURL = this.sanitizer.bypassSecurityTrustResourceUrl(
    //  '/assets/img/guia.pdf');

     

    this.dataset = null;
    this.embedURL = null;
    this.filename = null;

    this.guiaService.getGuiaById(this.id).subscribe((data: any)=>{
      this.dataset = data; 
      this.nroGuiaDespacho = data.folio_sii

      let ticket = data.tick_order_date + '-' + data.tick_order_code+ '-' + 
          data.tick_tkt_code;
      //this.guiaPDF = "http://localhost:8080/api/guiasPDF/1877015"
      //this.embedURL = this.guiaPDF
      //this.filename = this.embedURL.changingThisBreaksApplicationSecurity.split("/")[this.embedURL.changingThisBreaksApplicationSecurity.split("/").length-1]
      let fecha = this.datepipe.transform(data.fechaCreacion, 'yyyy-MM-dd')
      //let fecha = formatDate(data.fechaCreacion, 'yyyy-MM-dd');
      let fileURL = null;

      if(this.isIEOrEdge){
        fileURL = this.guiaService.getGuiaPDFString(data.folio_sii,
          fecha);

        this.guiaPDF = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL+'#zoom=100');
        //this.embedURL = this.guiaPDF
        this.filename = this.nroGuiaDespacho+".pdf"
      }

      else {
      
        this.guiaService.getGuiaPDFByTicket(data.folio_sii,
          fecha).subscribe((result: any)=>{
          
          fileURL = URL.createObjectURL(result);
          this.guiaPDF = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL+'#zoom=100');
          //this.embedURL = this.guiaPDF
          this.filename = this.nroGuiaDespacho+".pdf"
          //this.spinner.hide('sp6');
        });
        
      }


      let fileCedibleURL = null;

      if(this.isIEOrEdge){
        fileCedibleURL = this.guiaService.getGuiaPDFCedibleString(data.folio_sii,
          fecha);

        this.guiaCedible = this.sanitizer.bypassSecurityTrustResourceUrl(
          fileCedibleURL+'#zoom=100');
        this.filename = this.nroGuiaDespacho+".pdf"
      }

      else {
      
        this.guiaService.getGuiaPDFCedible(data.folio_sii,
          fecha).subscribe((result: any)=>{
          
          fileCedibleURL = URL.createObjectURL(result);
          this.guiaCedible = this.sanitizer.bypassSecurityTrustResourceUrl(
          fileCedibleURL+'#zoom=100');
          this.filename = this.nroGuiaDespacho+".pdf"
          
        });
        
      }

      
      /*this.guiaService.getGuiaPDFByTicket(data.folio_sii,
        fecha).subscribe((data: any)=>{       

        if(data){
          let fileURL = URL.createObjectURL(data);

          this.guiaPDF = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
          this.embedURL = this.guiaPDF
          this.filename = this.nroGuiaDespacho+".pdf"
        }
        else {
          this.guiaPDF = this.sanitizer.bypassSecurityTrustResourceUrl(
          '/assets/img/error.pdf#zoom=100');
          this.embedURL = this.guiaPDF
          this.filename = this.embedURL.changingThisBreaksApplicationSecurity.split("/")[this.embedURL.changingThisBreaksApplicationSecurity.split("/").length-1]
        }
        this.spinner.hide('sp6');
      },
      error => {
          this.guiaPDF = this.sanitizer.bypassSecurityTrustResourceUrl(
          '/assets/img/error.pdf#zoom=100');
          this.embedURL = this.guiaPDF
          this.filename = this.embedURL.changingThisBreaksApplicationSecurity.split("/")[this.embedURL.changingThisBreaksApplicationSecurity.split("/").length-1]
          this.spinner.hide('sp6');
      });*/
      let fileScanURL = null;
      if(this.isIEOrEdge){
        fileScanURL = this.guiaService.getGuiaEscaneadaString(
          data.folio_sii);
        console.log(fileScanURL)
        this.guiaEscaneada = this.sanitizer.bypassSecurityTrustResourceUrl(
          fileScanURL+'#zoom=100');
        this.embedURL = this.guiaEscaneada

        this.filename = this.nroGuiaDespacho+".pdf"
      }

      else {
      
        this.guiaService.getGuiaEscaneadaByTicket(data.folio_sii).
          subscribe((data: any)=>{

          fileScanURL = URL.createObjectURL(data);
          this.guiaEscaneada = this.sanitizer.bypassSecurityTrustResourceUrl(
            fileScanURL+'#zoom=100');
          this.embedURL = this.guiaEscaneada
          this.filename = this.nroGuiaDespacho+".pdf"
        });
        
      }
      if(this.isIEOrEdge)
        this.spinner.hide('sp6');

      this.guiaRepasoService.tiempoGuiaRepaso(this.id).subscribe((data: any)=>{

        let hora_carga_hora = null, hora_carga_minuto = null
        if(data.hora_carga){
          hora_carga_hora = +this.datepipe.transform(data.hora_carga, 'HH')
          hora_carga_minuto = +this.datepipe.transform(data.hora_carga, 'mm')
        }
        

        let salida_planta_hora = null, salida_planta_minuto = null
        if(data.salida_planta){
          salida_planta_hora = +this.datepipe.transform(data.salida_planta, 'HH')
          salida_planta_minuto = +this.datepipe.transform(data.salida_planta, 'mm')
        }
       

        let llegada_obra_hora = null, llegada_obra_minuto = null
        if(data.llegada_obra){
          llegada_obra_hora = +this.datepipe.transform(data.llegada_obra, 'HH')
          llegada_obra_minuto = +this.datepipe.transform(data.llegada_obra, 'mm')
        }
        

        let inicio_descarga_hora = null, inicio_descarga_minuto = null
        if(data.inicio_descarga){
          inicio_descarga_hora = +this.datepipe.transform(data.inicio_descarga, 'HH')
          inicio_descarga_minuto = +this.datepipe.transform(data.inicio_descarga, 'mm')
        }


        let salida_obra_hora = null, salida_obra_minuto = null
        if(data.salida_obra){
          salida_obra_hora = +this.datepipe.transform(data.salida_obra, 'HH')
          salida_obra_minuto = +this.datepipe.transform(data.salida_obra, 'mm')
        }
        

        let ingreso_planta_hora = null, ingreso_planta_minuto = null
        if(data.ingreso_planta){
          ingreso_planta_hora = +this.datepipe.transform(data.ingreso_planta, 'HH')
          ingreso_planta_minuto = +this.datepipe.transform(data.ingreso_planta, 'mm')
        }
        
        /*console.log(data.hora_carga)
        console.log(data.salida_planta)
        console.log(data.llegada_obra)
        console.log(data.inicio_descarga)
        console.log(data.salida_obra)
        console.log(data.ingreso_planta)*/
        //console.log(data.hora_carga)
        //console.log(tiempo)

        this.repasarForm.patchValue({
          horaCarga: {hour: hora_carga_hora, minute: hora_carga_minuto},
          salidaPlanta: {hour: salida_planta_hora, minute: salida_planta_minuto},
          llegadaObra: {hour: llegada_obra_hora, minute: llegada_obra_minuto},
          inicioDescarga: {hour: inicio_descarga_hora, minute: inicio_descarga_minuto},
          salidaObra: {hour: salida_obra_hora, minute: salida_obra_minuto},
          ingresoPlanta: {hour: ingreso_planta_hora, minute: ingreso_planta_minuto}
        });

        
        this.guiaRepasoService.getGuiaRepaso(this.id).subscribe((repaso: any)=>{

          if(repaso){
            /*console.log("Existe Guia Repaso")
            console.log(data)*/

            
            if(repaso.rc_firmado == 1)
              repaso.rc_firmado = true
            else if(repaso.rc_firmado == 0)
              repaso.rc_firmado = false
            else repaso.rc_firmado = null

            if(repaso.ac_firmado_agua == 1)
              repaso.ac_firmado_agua = true
            else if(repaso.ac_firmado_agua == 0)
              repaso.ac_firmado_agua = false
            else repaso.ac_firmado_agua = null

            if(repaso.ac_firmado_adit == 1)
              repaso.ac_firmado_adit = true
            else if(repaso.ac_firmado_adit == 0)
              repaso.ac_firmado_adit = false
            else repaso.ac_firmado_adit = null

            if(repaso.ac_firmado_tipo_adit == 1)
              repaso.ac_firmado_tipo_adit = true
            else if(repaso.ac_firmado_tipo_adit == 0)
              repaso.ac_firmado_tipo_adit = false
            else repaso.ac_firmado_tipo_adit = null

            if(repaso.ac_firmado_tiempo_camion == 1)
              repaso.ac_firmado_tiempo_camion = true
            else if(repaso.ac_firmado_tiempo_camion == 0)
              repaso.ac_firmado_tiempo_camion = false
            else repaso.ac_firmado_tiempo_camion = null

            if(repaso.ac_firmado_hormigon == 1)
              repaso.ac_firmado_hormigon = true
            else if(repaso.ac_firmado_hormigon == 0)
              repaso.ac_firmado_hormigon = false
            else repaso.ac_firmado_hormigon = null



            //let hora_carga_hora = null, hora_carga_minuto = null
            if(repaso.hora_carga){
              let hora_carga = repaso.hora_carga.split(":");
              hora_carga_hora = +hora_carga[0]
              hora_carga_minuto = +hora_carga[1]
            }
            else if(data.hora_carga){
              hora_carga_hora = +this.datepipe.transform(data.hora_carga, 'HH')
              hora_carga_minuto = +this.datepipe.transform(data.hora_carga, 'mm')
            }


            //let salida_planta_hora = null, salida_planta_minuto = null
            if(repaso.salida_planta){
              let salida_planta = repaso.salida_planta.split(":");
              salida_planta_hora = +salida_planta[0]
              salida_planta_minuto = +salida_planta[1]
            }
            else if(data.salida_planta){
              salida_planta_hora = +this.datepipe.transform(data.salida_planta, 'HH')
              salida_planta_minuto = +this.datepipe.transform(data.salida_planta, 'mm')
            }
               

            //let llegada_obra_hora = null, llegada_obra_minuto = null
            if(repaso.llegada_obra){
              let llegada_obra = repaso.llegada_obra.split(":");
              llegada_obra_hora = +llegada_obra[0]
              llegada_obra_minuto = +llegada_obra[1]
            }
            else if(data.llegada_obra){
              llegada_obra_hora = +this.datepipe.transform(data.llegada_obra, 'HH')
              llegada_obra_minuto = +this.datepipe.transform(data.llegada_obra, 'mm')
            }
            

            //let inicio_descarga_hora = null, inicio_descarga_minuto = null
            if(repaso.inicio_descarga){
              let inicio_descarga = repaso.inicio_descarga.split(":");
              inicio_descarga_hora = +inicio_descarga[0]
              inicio_descarga_minuto = +inicio_descarga[1]
            }
            else if(data.inicio_descarga){
              inicio_descarga_hora = +this.datepipe.transform(data.inicio_descarga, 'HH')
              inicio_descarga_minuto = +this.datepipe.transform(data.inicio_descarga, 'mm')
            }



            //let salida_obra_hora = null, salida_obra_minuto = null
            if(repaso.salida_obra){
              let salida_obra = repaso.salida_obra.split(":");
              salida_obra_hora = +salida_obra[0]
              salida_obra_minuto = +salida_obra[1]
            }
            else if(data.salida_obra){
              salida_obra_hora = +this.datepipe.transform(data.salida_obra, 'HH')
              salida_obra_minuto = +this.datepipe.transform(data.salida_obra, 'mm')
            }
            

            //let ingreso_planta_hora = null, ingreso_planta_minuto = null
            if(repaso.ingreso_planta){
              let ingreso_planta = repaso.ingreso_planta.split(":");
              ingreso_planta_hora = +ingreso_planta[0]
              ingreso_planta_minuto = +ingreso_planta[1]
            }
            else if(data.ingreso_planta){
              ingreso_planta_hora = +this.datepipe.transform(data.ingreso_planta, 'HH')
              ingreso_planta_minuto = +this.datepipe.transform(data.ingreso_planta, 'mm')
            }

            this.switchChange(repaso.folios_ok,false)

            this.repasarForm.patchValue({
              folios_ok: repaso.folios_ok,
              horaCarga: {hour: hora_carga_hora, minute: hora_carga_minuto},
              salidaPlanta: {hour: salida_planta_hora, minute: salida_planta_minuto},
              llegadaObra: {hour: llegada_obra_hora, minute: llegada_obra_minuto},
              inicioDescarga: {hour: inicio_descarga_hora, minute: inicio_descarga_minuto},
              salidaObra: {hour: salida_obra_hora, minute: salida_obra_minuto},
              ingresoPlanta: {hour: ingreso_planta_hora, minute: ingreso_planta_minuto},
              /*horaCarga: {hour: 9, minute: 0},
              salidaPlanta: {hour: 10, minute: 30},
              llegadaObra: {hour: 11, minute: 30},
              inicioDescarga: {hour: 13, minute: 30},
              salidaObra: {hour: 14, minute: 30},
              ingresoPlanta: {hour: 15, minute: 30},*/

              observaciones: repaso.obs,
              solicitudNC: repaso.solicitud_nc,
              nombreCliente: repaso.rc_nombre,
              rutCliente: repaso.rc_rut,
                //noFirmadoCliente: false,
                //firmadoCliente: [false, Validators.requiredTrue],
              firmadoCliente: repaso.rc_firmado,

              cantidadAdicAgua: repaso.ac_agua,
              solicitanteAdicAgua: repaso.ac_solicitante_agua,
              firmadoAdicAgua: repaso.ac_firmado_agua,

              cantidadAdicAditivo: repaso.ac_adit_cant,
              solicitanteAdic: repaso.ac_solicitante_adit,
              firmadoAdicAditivo: repaso.ac_firmado_adit,

              selectedAdicAditivo: null,
              solicitanteTipoAditivo: repaso.ac_solicitante_tipo_adit,
              firmadoTipoAditivo: repaso.ac_firmado_tipo_adit,

              selectedTipoAditivo: repaso.ac_tipo_adit,

              tiempoCamionObra: repaso.ac_tiempo_camion,
              solicitanteCamionObra:repaso.ac_solicitante_tiempo_camion,
              firmadoCamionObra: repaso.ac_firmado_tiempo_camion,      

              mCubicHormigon: repaso.ac_hormigon,
              solicitanteHormigon:repaso.ac_solicitante_hormigon,
              firmadoHormigon: repaso.ac_firmado_hormigon,

              muestraPropia: repaso.mue_propia,
              muestraCliente: repaso.mue_cliente,
              //nombreHormigon: null,

              selectedLaboratorio: repaso.mue_laboratorio,
              numeroMuestra: repaso.mue_numero,
              asentamientoCono: repaso.mue_asentamiento,
              //litroAditivo: null,
                
              //emailInterino: null,
              camionDevuelto: repaso.camion_devuelto,




               /*ac_adit_cant = data.ac_adit_cant,
               ac_agua = data.ac_agua,
               ac_firmado_adit = data.ac_firmado_adit,
               ac_firmado_agua = data.ac_firmado_agua,
               ac_firmado_hormigon = data.ac_firmado_hormigon,
               ac_firmado_tiempo_camion = data.ac_firmado_tiempo_camion,
               ac_firmado_tipo_adit = data.ac_firmado_tipo_adit,
               ac_hormigon = data.ac_hormigon,
               ac_solicitante_adit = data.ac_solicitante_adit,
               ac_solicitante_agua = data.ac_solicitante_agua,
               ac_solicitante_hormigon = data.ac_solicitante_hormigon,
               ac_solicitante_tiempo_camion = data.ac_solicitante_tiempo_camion,
               ac_solicitante_tipo_adit = data.ac_solicitante_tipo_adit,
               ac_tiempo_camion = data.ac_tiempo_camion,
               ac_tipo_adit = data.ac_tipo_adit,
               camion_devuelto = data.camion_devuelto,
               folios_ok = data.folios_ok,
               hora_carga = data.hora_carga,
               ingreso_planta = data.ingreso_planta,
               inicio_descarga = data.inicio_descarga,
               llegada_obra = data.llegada_obra,
               mue_asentamiento = data.mue_asentamiento,
               mue_cliente = data.mue_cliente,
               mue_laboratorio = data.mue_laboratorio,
               mue_numero = data.mue_numero,
               mue_propia = data.mue_propia,
               obs = data.obs,
               rc_firmado = data.rc_firmado,
               rc_nombre = data.rc_nombre,
               rc_rut = data.rc_rut,
               salida_obra = data.salida_obra,
               salida_planta = data.salida_planta,
               solicitud_nc = data.solicitud_nc,*/
            });

            if(repaso.rc_firmado){
              this.nombreValidator()
              this.rutValidator()
            }            


          }
          this.spinner.hide('sp6');
        
        });

        
      });


      /*this.guiaService.getGuiaEscaneadaByTicket(data.folio_sii).subscribe((data: any)=>{

        if(data){
          let fileURL = URL.createObjectURL(data);

          this.guiaEscaneada = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);

          this.filename = this.nroGuiaDespacho+".pdf"
        }
        else {
          this.guiaEscaneada = this.sanitizer.bypassSecurityTrustResourceUrl(
          '/assets/img/error.pdf#zoom=100');
          this.filename = this.embedURL.changingThisBreaksApplicationSecurity.split("/")[this.embedURL.changingThisBreaksApplicationSecurity.split("/").length-1]
        }

      },
      error => {
          this.guiaEscaneada = this.sanitizer.bypassSecurityTrustResourceUrl(
          '/assets/img/error.pdf#zoom=100');
          this.filename = this.embedURL.changingThisBreaksApplicationSecurity.split("/")[this.embedURL.changingThisBreaksApplicationSecurity.split("/").length-1]
      })*/
           
    });   
  }

  nombreValidator(){
    //console.log(this.repasarForm.value.nombreCliente)
    //console.log(this.repasarForm.value.nombreCliente === '')
    if(this.repasarForm.value.nombreCliente === '' ||
      this.repasarForm.value.nombreCliente === null)
      this.nombreRequired = true;
    else
      this.nombreRequired = false;
  }

  rutValidator(){
    if(this.repasarForm.value.rutCliente === '' || 
      this.repasarForm.value.rutCliente === null && 
      this.repasarForm.value.firmadoCliente)
      this.rutRequired = true;
    else{
     
     let rut = this.repasarForm.get('rutCliente').value
     
     if(this.repasarForm.get('firmadoCliente').value)
        this.rutRequired = false;
     
     if(rut.indexOf("k") && rut.indexOf("k") == rut.length-1){
        let rutAValidar =+rut.substring(0,rut.length-1)
        if(this.checkDigitoVerificador(rutAValidar,'k')){
          //this.repasarForm.patchValue({rutCliente: null})
          this.validRut = false;
          //this.rutRequired = true;
        }
        else this.validRut = true;
        
     }

     else {
       let rutAValidar =+this.repasarForm.get('rutCliente').value
       let rutSinDV = rut.substring(0,rut.length-1)
       //console.log(rutSinDV + ' '+ rutAValidar%10)
       if(this.checkDigitoVerificador(rutSinDV,rutAValidar%10)){
        //this.repasarForm.patchValue({rutCliente: null})
        this.validRut = false;  
        //this.rutRequired = true;
       }
       else this.validRut = true;       
     }

    }
  }

  onChangeSrc(guia) {
    if(guia === 'escaneada') {
      /*this.embedURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      '/assets/img/prueba.png');
      this.filename = "prueba.png"*/
      this.electronica = false;
      this.escaneada = true;
      this.cedible = false;
      this.embedURL = this.guiaEscaneada
      this.toggle = [false,false,true];
    }
    else if (guia === 'cedible') {
      this.electronica = false;
      this.escaneada = false;
      this.cedible = true;
      this.embedURL = this.guiaCedible
      this.toggle = [false,true,false];
    }
    else if (guia === 'electronica') {
      this.electronica = true;
      this.escaneada = false;
      this.cedible = false;
      this.embedURL = this.guiaPDF
      this.toggle = [true,false,false];
    }
  }

  preview(files) {
    if (files.length === 0)
      return;
 
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
 
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => { 
      this.imgURL = reader.result; 
    }
  }

  /*check(value){
    console.log(value)
    if(value === 'yes'){
      this.checkYes = true;
      this.checkNo = false;
    }
    else if(value === 'no'){
      this.checkYes = false;
      this.checkNo = true;
    }
  }*/

  onRepasarSubmit(repasarData){
    //console.log(repasarData.salidaPlanta.minute < 10)

    if(repasarData.folios_ok !== 0){
      if(repasarData.horaCarga.hour < 10)
        var horaCarga = '0'+repasarData.horaCarga.hour
      else var horaCarga = ''+repasarData.horaCarga.hour
      
      if(repasarData.horaCarga.minute < 10)
        var minutoCarga = '0'+repasarData.horaCarga.minute
      else var minutoCarga = ''+repasarData.horaCarga.minute
      
      if(repasarData.salidaPlanta.hour < 10)
        var horaSalidaPlanta = '0'+repasarData.salidaPlanta.hour
      else var horaSalidaPlanta = ''+repasarData.salidaPlanta.hour
      
      if(repasarData.salidaPlanta.minute < 10)
        var minutoSalidaPlanta = '0'+repasarData.salidaPlanta.minute
      else var minutoSalidaPlanta = ''+repasarData.salidaPlanta.minute
      
      if(repasarData.llegadaObra.hour < 10)
        var horaLlegadaObra = '0'+repasarData.llegadaObra.hour
      else var horaLlegadaObra = ''+repasarData.llegadaObra.hour
      
      if(repasarData.llegadaObra.minute < 10)
        var minutoLlegadaObra = '0'+repasarData.llegadaObra.minute
      else var minutoLlegadaObra = ''+repasarData.llegadaObra.minute

      if(repasarData.inicioDescarga.hour < 10)
        var horaInicioDescarga = '0'+repasarData.inicioDescarga.hour
      else var horaInicioDescarga = ''+repasarData.inicioDescarga.hour
      
      if(repasarData.inicioDescarga.minute < 10)
        var minutoInicioDescarga = '0'+repasarData.inicioDescarga.minute
      else var minutoInicioDescarga = ''+repasarData.inicioDescarga.minute

      if(repasarData.salidaObra.hour < 10)
        var horaSalidaObra = '0'+repasarData.salidaObra.hour
      else var horaSalidaObra = ''+repasarData.salidaObra.hour
      
      if(repasarData.salidaObra.minute < 10)
        var minutoSalidaObra = '0'+repasarData.salidaObra.minute
      else var minutoSalidaObra = ''+repasarData.salidaObra.minute

      if(repasarData.ingresoPlanta.hour < 10)
        var horaIngresoPlanta = '0'+repasarData.ingresoPlanta.hour
      else var horaIngresoPlanta = ''+repasarData.ingresoPlanta.hour
      
      if(repasarData.ingresoPlanta.minute < 10)
        var minutoIngresoPlanta = '0'+repasarData.ingresoPlanta.minute
      else var minutoIngresoPlanta = ''+repasarData.ingresoPlanta.minute


      if(repasarData.solicitudNC) repasarData.solicitudNC = 1
      else repasarData.solicitudNC = 0

      //console.log(repasarData)
      if(repasarData.firmadoCliente) repasarData.firmadoCliente = 1
      else if(repasarData.firmadoCliente == null) repasarData.firmadoCliente = -1
      else repasarData.firmadoCliente = 0

      if(repasarData.firmadoAdicAgua) repasarData.firmadoAdicAgua = 1
      else if(repasarData.firmadoAdicAgua == null) repasarData.firmadoAdicAgua = -1
      else repasarData.firmadoAdicAgua = 0

      if(repasarData.firmadoAdicAditivo) repasarData.firmadoAdicAditivo = 1
      else if(repasarData.firmadoAdicAditivo == null) repasarData.firmadoAdicAditivo = -1
      else repasarData.firmadoAdicAditivo = 0

      if(repasarData.firmadoTipoAditivo) repasarData.firmadoTipoAditivo = 1
      else if(repasarData.firmadoTipoAditivo == null) repasarData.firmadoTipoAditivo = -1
      else repasarData.firmadoTipoAditivo = 0

      if(repasarData.firmadoCamionObra) repasarData.firmadoCamionObra = 1
      else if(repasarData.firmadoCamionObra == null) repasarData.firmadoCamionObra = -1
      else repasarData.firmadoCamionObra = 0

      if(repasarData.firmadoHormigon) repasarData.firmadoHormigon = 1
      else if(repasarData.firmadoHormigon == null) repasarData.firmadoHormigon = -1
      else repasarData.firmadoHormigon = 0

      if(repasarData.muestraPropia) repasarData.muestraPropia = 1
      else repasarData.muestraPropia = 0

      if(repasarData.muestraCliente) repasarData.muestraCliente = 1
      else repasarData.muestraCliente = 0

      if(repasarData.camionDevuelto) repasarData.camionDevuelto = 1
      else repasarData.camionDevuelto = 0

      if(repasarData.mCubicHormigon === null)
        repasarData.mCubicHormigon = 0


      //console.log(repasarData)


      const newItem = {
        id: 0,
        obs: repasarData.observaciones,
        usuario: this.name,
        hora_carga: horaCarga+':'+minutoCarga,
        salida_planta: horaSalidaPlanta+':'+minutoSalidaPlanta,
        llegada_obra: horaLlegadaObra+':'+minutoLlegadaObra,
        inicio_descarga: horaInicioDescarga+':'+minutoInicioDescarga,
        salida_obra: horaSalidaObra+':'+minutoSalidaObra,
        ingreso_planta: horaIngresoPlanta+':'+minutoIngresoPlanta,
        solicitud_nc: repasarData.solicitudNC,
        rc_nombre: repasarData.nombreCliente,
        rc_rut: repasarData.rutCliente,
        //rc_recinto: repasarData.recintoCliente,
        rc_firmado: repasarData.firmadoCliente,      
        folios_ok: repasarData.folios_ok,

        ac_agua: repasarData.cantidadAdicAgua,
        ac_solicitante_agua: repasarData.solicitanteAdicAgua,
        ac_firmado_agua: repasarData.firmadoAdicAgua,

        ac_adit_cant: repasarData.cantidadAdicAditivo,
        ac_solicitante_adit: repasarData.solicitanteAdic,
        ac_firmado_adit: repasarData.firmadoAdicAditivo,

        ac_tipo_adit: repasarData.selectedTipoAditivo,
        ac_solicitante_tipo_adit: repasarData.solicitanteTipoAditivo,
        ac_firmado_tipo_adit: repasarData.firmadoTipoAditivo,

        //ac_aditivo: repasarData.selectedTipoAditivo,

        ac_tiempo_camion: repasarData.tiempoCamionObra,
        ac_solicitante_tiempo_camion: repasarData.solicitanteCamionObra,
        ac_firmado_tiempo_camion: repasarData.firmadoCamionObra,

        ac_hormigon: repasarData.mCubicHormigon,
        ac_solicitante_hormigon: repasarData.solicitanteHormigon,
        ac_firmado_hormigon: repasarData.firmadoHormigon,
        

        /*dh_m3: repasarData.mCubicHormigon,
        dh_destino_final: repasarData.destinoFinalHormigon,
        dh_nombre: repasarData.nombreHormigon,
        dh_firmado: repasarData.noFirmado,
        bom_cantidad: repasarData.cantidadBombeo,
        bom_cod_bomba: repasarData.codBombeo,
        bom_proveedor: repasarData.selectedProveedor,
        bom_report: repasarData.reportBombeo,*/

        mue_propia: repasarData.muestraPropia,
        mue_cliente: repasarData.muestraCliente,

        mue_laboratorio: repasarData.selectedLaboratorio,
        mue_numero: repasarData.numeroMuestra,
        mue_asentamiento: repasarData.asentamientoCono,
        
        camion_devuelto: repasarData.camionDevuelto
      };

      console.log(newItem);
      this.spinner.show('sp6'); 
      this.guiaRepasoService.createGuiaRepaso(newItem,this.id).subscribe((res)=>{
          this.spinner.hide('sp6'); 
          window.alert("Guia Repaso Guardada");
      });
    }
    else {
      //console.log("Entro a folio 0")
      const newItem = {
        id: 0,
        obs: null,
        usuario: this.name,
        hora_carga: null,
        salida_planta: null,
        llegada_obra: null,
        inicio_descarga: null,
        salida_obra: null,
        ingreso_planta: null,
        solicitud_nc: null,
        rc_nombre: null,
        rc_rut: null,
        //rc_recinto: repasarData.recintoCliente,
        rc_firmado: null,      
        folios_ok: repasarData.folios_ok,

        ac_agua: null,
        ac_solicitante_agua: null,
        ac_firmado_agua: null,

        ac_adit_cant: null,
        ac_solicitante_adit: null,
        ac_firmado_adit: null,

        ac_tipo_adit: null,
        ac_solicitante_tipo_adit: null,
        ac_firmado_tipo_adit: null,

        //ac_aditivo: repasarData.selectedTipoAditivo,

        ac_tiempo_camion: null,
        ac_solicitante_tiempo_camion: null,
        ac_firmado_tiempo_camion: null,

        ac_hormigon: null,
        ac_solicitante_hormigon: null,
        ac_firmado_hormigon: null,
        

        /*dh_m3: repasarData.mCubicHormigon,
        dh_destino_final: repasarData.destinoFinalHormigon,
        dh_nombre: repasarData.nombreHormigon,
        dh_firmado: repasarData.noFirmado,
        bom_cantidad: repasarData.cantidadBombeo,
        bom_cod_bomba: repasarData.codBombeo,
        bom_proveedor: repasarData.selectedProveedor,
        bom_report: repasarData.reportBombeo,*/

        mue_propia: null,
        mue_cliente: null,

        mue_laboratorio: null,
        mue_numero: null,
        mue_asentamiento: null,
        
        camion_devuelto: null
      };

      console.log(newItem);
      this.spinner.show('sp6'); 
      this.guiaRepasoService.createGuiaRepaso(newItem,this.id).subscribe((res)=>{
          this.spinner.hide('sp6'); 
          window.alert("Guia Repaso Guardada");
      });


    }
    

  }

  searchFolio(){
    //console.log(this.search);
    this.guiaService.getGuiaByFolio(this.search).subscribe((data: any)=>{
      if(data) {
        window.sessionStorage.removeItem('datasetIds');
        window.sessionStorage.setItem('nroGuiaDespacho', data.folio_sii);
        window.location.href = '/guiasDespacho/'+data.id
        //this.router.navigate(['/guiasDespacho', data.id]);
        //window.alert("Folio Encontrado");
      }
      else window.alert("Folio no encontrado");
    });   
  }

  switchChange(value,confirmar){
    //console.log(value)
    //console.log(this.repasarForm)
    if(value == 1) {
      this.disabledAll = false
      this.repasarForm.get('selectedAdicAditivo').enable();
      //this.repasarForm.get('selectedProveedor').enable();
      this.repasarForm.get('selectedLaboratorio').enable();
      this.repasarForm.get('selectedTipoAditivo').enable();
    }
    else if(value == 0) {

      if(confirmar){
        if(confirm("Estas seguro que quieres borrar los datos ingresados?")) {      
          this.disabledAll = true
          this.repasarForm.get('selectedAdicAditivo').disable();
          //this.repasarForm.get('selectedProveedor').disable();
          this.repasarForm.get('selectedLaboratorio').disable();
          this.repasarForm.get('selectedTipoAditivo').disable();
          this.resetForm();
        }
        else this.switchChange(1,true)
      }
      else{
        this.disabledAll = true
        this.repasarForm.get('selectedAdicAditivo').disable();
        //this.repasarForm.get('selectedProveedor').disable();
        this.repasarForm.get('selectedLaboratorio').disable();
        this.repasarForm.get('selectedTipoAditivo').disable();
      }
      
      
    }
    else if (value == null){
      if(confirm("Estas seguro que quieres borrar los datos ingresados?")) { 
        this.disabledAll = true
        this.repasarForm.get('selectedAdicAditivo').disable();
        //this.repasarForm.get('selectedProveedor').disable();
        this.repasarForm.get('selectedLaboratorio').disable();
        this.repasarForm.get('selectedTipoAditivo').disable();
        this.resetForm();
      }
      else this.switchChange(1,true)
    }
  }

  switchFirm(value){
    if(value == true) {
      if(this.repasarForm.value.nombreCliente === '' ||
        this.repasarForm.value.nombreCliente === null)
        this.nombreRequired = true
      
      if(this.repasarForm.value.rutCliente === '' || 
        this.repasarForm.value.rutCliente === null)
        this.rutRequired = true
    }
    else {
      this.nombreRequired = false
      this.rutRequired = false
    }
  }

  resetForm(){
    this.repasarForm.patchValue({
      observaciones: null,
      solicitudNC: false,
      nombreCliente: null,
      rutCliente: null,
      firmadoCliente: null,

      cantidadAdicAgua: null,
      solicitanteAdicAgua: null,
      firmadoAdicAgua: null,

      cantidadAdicAditivo: null,
      solicitanteAdic: null,
      firmadoAdicAditivo: null,

      selectedAdicAditivo: null,
      solicitanteTipoAditivo: null,
      firmadoTipoAditivo: null,

      selectedTipoAditivo: null,

      tiempoCamionObra:null,
      solicitanteCamionObra:null,
      firmadoCamionObra: null,      

      mCubicHormigon: null,
      solicitanteHormigon:null,
      firmadoHormigon: null,

      muestraPropia: false,
      muestraCliente: false,
      
      selectedLaboratorio: null,
      numeroMuestra: null,
      asentamientoCono: null,
     
      //emailInterino: null,
      camionDevuelto: false,

    })
  }

  checkDigitoVerificador(T,dv) {
    var M = 0, S = 1;
    for (; T; T = Math.floor(T / 10))
        S = (S + T % 10 * (9 - M++ % 6)) % 11;
        if(S){
          S=S-1
          return S != dv
        }
        else return 'k'!=dv
  }

  timeValidator(type,time){

    this.validTime = [true,true,true,true,true,true];
    this.checkTime = false;
  
    if(type==="horaCarga"){
      //console.log(time)
      //console.log(this.repasarForm.value.salidaPlanta)
      if(time && this.repasarForm.value.salidaPlanta.hour && 
        this.repasarForm.value.salidaPlanta.minute){
        if(time.hour == this.repasarForm.value.salidaPlanta.hour && 
        time.minute == this.repasarForm.value.salidaPlanta.minute || 
        time.hour == this.repasarForm.value.salidaPlanta.hour && 
        time.minute > this.repasarForm.value.salidaPlanta.minute ||
        time.hour > this.repasarForm.value.salidaPlanta.hour){
          //this.repasarForm.patchValue({horaCarga: null})
          this.checkTime = true;
          this.validTime[0]=false;
        }
      }
    }
    else if(type==="salidaPlanta"){

      if(time && this.repasarForm.value.horaCarga.hour && 
        this.repasarForm.value.horaCarga.minute){
        if(time.hour == this.repasarForm.value.horaCarga.hour && 
        time.minute == this.repasarForm.value.horaCarga.minute || 
        time.hour == this.repasarForm.value.horaCarga.hour && 
        time.minute < this.repasarForm.value.horaCarga.minute ||
        time.hour < this.repasarForm.value.horaCarga.hour){  
          //this.repasarForm.patchValue({salidaPlanta: null})
          this.checkTime = true;
          this.validTime[1]=false;
        }
      }

      if(time && this.repasarForm.value.llegadaObra.hour && 
        this.repasarForm.value.llegadaObra.minute){
        if(time.hour == this.repasarForm.value.llegadaObra.hour && 
        time.minute == this.repasarForm.value.llegadaObra.minute || 
        time.hour == this.repasarForm.value.llegadaObra.hour && 
        time.minute > this.repasarForm.value.llegadaObra.minute ||
        time.hour > this.repasarForm.value.llegadaObra.hour){  
          //this.repasarForm.patchValue({salidaPlanta: null})
          this.checkTime = true;
          this.validTime[1]=false;
        }
      } 
    }
    else if(type==="llegadaObra"){
      
      if(time && this.repasarForm.value.salidaPlanta.hour && 
        this.repasarForm.value.salidaPlanta.minute){
        if(time.hour == this.repasarForm.value.salidaPlanta.hour && 
        time.minute == this.repasarForm.value.salidaPlanta.minute || 
        time.hour == this.repasarForm.value.salidaPlanta.hour && 
        time.minute < this.repasarForm.value.salidaPlanta.minute ||
        time.hour < this.repasarForm.value.salidaPlanta.hour){
          //this.repasarForm.patchValue({llegadaObra: null})
          this.checkTime = true;
          this.validTime[2]=false;
        }
      }

      if(time && this.repasarForm.value.inicioDescarga.hour && 
        this.repasarForm.value.inicioDescarga.minute){
        if(time.hour == this.repasarForm.value.inicioDescarga.hour && 
        time.minute == this.repasarForm.value.inicioDescarga.minute || 
        time.hour == this.repasarForm.value.inicioDescarga.hour && 
        time.minute > this.repasarForm.value.inicioDescarga.minute ||
        time.hour > this.repasarForm.value.inicioDescarga.hour){  
          //this.repasarForm.patchValue({llegadaObra: null})
          this.checkTime = true;
          this.validTime[2]=false;
        }
      }
      
    }
    else if(type==="inicioDescarga"){
     
     if(time && this.repasarForm.value.llegadaObra.hour && 
        this.repasarForm.value.llegadaObra.minute){
        if(time.hour == this.repasarForm.value.llegadaObra.hour && 
        time.minute == this.repasarForm.value.llegadaObra.minute || 
        time.hour == this.repasarForm.value.llegadaObra.hour && 
        time.minute < this.repasarForm.value.llegadaObra.minute ||
        time.hour < this.repasarForm.value.llegadaObra.hour){ 
          //this.repasarForm.patchValue({inicioDescarga: null})
          this.checkTime = true;
          this.validTime[3]=false;
        }
      }
     if(time && this.repasarForm.value.salidaObra.hour && 
        this.repasarForm.value.salidaObra.minute){
       if(time.hour == this.repasarForm.value.salidaObra.hour && 
        time.minute == this.repasarForm.value.salidaObra.minute || 
        time.hour == this.repasarForm.value.salidaObra.hour && 
        time.minute > this.repasarForm.value.salidaObra.minute ||
        time.hour > this.repasarForm.value.salidaObra.hour){  
          //this.repasarForm.patchValue({inicioDescarga: null})
          this.checkTime = true;
          this.validTime[3]=false;
        }
      }
      
    }
    else if(type==="salidaObra"){

      if(time && this.repasarForm.value.inicioDescarga.hour && 
        this.repasarForm.value.inicioDescarga.minute){
        if(time.hour == this.repasarForm.value.inicioDescarga.hour && 
        time.minute == this.repasarForm.value.inicioDescarga.minute || 
        time.hour == this.repasarForm.value.inicioDescarga.hour && 
        time.minute < this.repasarForm.value.inicioDescarga.minute ||
        time.hour < this.repasarForm.value.inicioDescarga.hour){  
          //this.repasarForm.patchValue({salidaObra: null})
          this.checkTime = true;
          this.validTime[4]=false;
        }
      }

      if(time && this.repasarForm.value.ingresoPlanta.hour && 
        this.repasarForm.value.ingresoPlanta.minute){
       if(time.hour == this.repasarForm.value.ingresoPlanta.hour && 
        time.minute == this.repasarForm.value.ingresoPlanta.minute || 
        time.hour == this.repasarForm.value.ingresoPlanta.hour && 
        time.minute > this.repasarForm.value.ingresoPlanta.minute ||
        time.hour > this.repasarForm.value.salidaObra.hour){  
          //this.repasarForm.patchValue({salidaObra: null})
          this.checkTime = true;
          this.validTime[4]=false;
        }
      }
      
    }
    else if(type==="ingresoPlanta"){

      if(time && this.repasarForm.value.salidaObra.hour && 
        this.repasarForm.value.salidaObra.minute){
        if(time.hour == this.repasarForm.value.salidaObra.hour && 
        time.minute == this.repasarForm.value.salidaObra.minute || 
        time.hour == this.repasarForm.value.salidaObra.hour && 
        time.minute < this.repasarForm.value.salidaObra.minute ||
        time.hour < this.repasarForm.value.salidaObra.hour){
          this.checkTime = true;
          this.validTime[5]=false;  
          //this.repasarForm.patchValue({ingresoPlanta: null})
        }  
      }    
    }
  }
}