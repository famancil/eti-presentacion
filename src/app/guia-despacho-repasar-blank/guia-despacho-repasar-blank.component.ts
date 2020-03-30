import { Component, OnInit } from '@angular/core';
import { GuiaService } from '../guia.service';

@Component({
  selector: 'app-guia-despacho-repasar-blank',
  templateUrl: './guia-despacho-repasar-blank.component.html',
  styleUrls: ['./guia-despacho-repasar-blank.component.css']
})
export class GuiaDespachoRepasarBlankComponent implements OnInit {

  search;

  constructor(private guiaService: GuiaService) { }

  ngOnInit() {
  }

  searchFolio(){
    
    this.guiaService.getGuiaByFolio(this.search).subscribe((data: any)=>{
      if(data) {
        localStorage.removeItem('datasetIds');
        localStorage.setItem('nroGuiaDespacho', data.folio_sii);
        window.location.href = '/guiasDespacho/'+data.id;
      }
      else window.alert("Folio no encontrado");
    });   
  }

}
