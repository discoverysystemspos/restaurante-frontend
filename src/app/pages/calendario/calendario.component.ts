import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  setHours, 
  setMinutes
} from 'date-fns';

import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// SERVICES
import { CalendarioService } from '../../services/calendario.service';

// MODELS
import { Calendario } from 'src/app/models/calendario.model';

registerLocaleData(localeEs);

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styles: [
  ]
})
export class CalendarioComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  public view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  // ELIMINAR EVENTOS
  
  actions: CalendarEventAction[] = [
    {
      label: '<i class="bi-trash"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        
        console.log(event);

        this.calendarioService.deleteCalendario(event.calid)
            .subscribe( (resp: { ok: boolean, msg: string }) => {

              if (resp.ok) {
                
                this.events = this.events.filter((iEvent) => iEvent !== event);
                this.handleEvent('Deleted', event);
                
                Swal.fire('Estupendo', resp.msg, 'success');
                
              }else{
                
                Swal.fire('Error', resp.msg, 'error');
              }
              

            });
        
      },
    },
  ];
  // ELIMINAR EVENTOS

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.blue,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: false,
    },
  ];

  activeDayIsOpen: boolean = true;

  // =====================================================================================
  // CONSTRUCTOR
  // =====================================================================================

  constructor(  private modal: NgbModal,
                private fb:FormBuilder,
                private calendarioService: CalendarioService) { }

  ngOnInit(): void {

    // CARGAR CALENDARIOS
    this.cargarCalendario();
    
  }

  // =====================================================================================
  // CONSTRUCTOR
  // =====================================================================================

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {

    if (action !== 'Deleted') {      
      this.modalData = { event, action };
      this.modal.open(this.modalContent, { size: 'sm' });
    }
  }

  /** ================================================================
   *  CREAR CALENDARIO
  ==================================================================== */
  public formSubmitted = false;
  public evento: Calendario;
  public newCalendarioForm = this.fb.group({
    start: [ '' , [Validators.required]],
    end: ['', [Validators.required]],
    title: ['', [Validators.required]],
  });

  crearCalendario(){

    this.formSubmitted = true;

    if (this.newCalendarioForm.invalid) {
      return;
    }

    // SET HOURS  
    let inicial;
    let final;    

    inicial = new Date(this.newCalendarioForm.value.start);      
    const initial = new Date(inicial.getTime() - 1000 * 60 * 60 * 5);
    

    final = new Date(this.newCalendarioForm.value.end);
    const end = new Date(final.getTime() - 1000 * 60 * 60 * 5);
    
    // // SET HOURS 

    this.newCalendarioForm.value.start = initial;
    this.newCalendarioForm.value.end = end;
    

    this.calendarioService.createCalendario(this.newCalendarioForm.value)
        .subscribe((resp:{ok:boolean, calendario: Calendario}) => {

          Swal.fire('Estupendo', 'Se ha creado exitosamente en el calendario!', 'success');

          this.evento = resp.calendario;

          this.formSubmitted = false;
          this.newCalendarioForm.reset();    

          this.addEvent();

        });
        
  }

  addEvent(): void {

    // SET HOURS  
    let inicial;
    let final;    

    inicial = new Date(this.evento.start);      
    const initial = new Date(inicial.getTime() + 1000 * 60 * 60 * 5);
    

    final = new Date(this.evento.end);
    const end = new Date(final.getTime() + 1000 * 60 * 60 * 5);    
    // SET HOURS 
    
    this.events = [
      ...this.events,
      {
        title: `${this.evento.title} - ${ initial.getHours()}:${initial.getMinutes()}`,
        start: initial,
        end: end,
        color: colors.blue,
        actions: this.actions,
        user: this.evento.user,
        calid: this.evento.calid,
        resizable: {
          beforeStart: true,
          afterEnd: true,
         },
      },
    ];
  } 

  /** ================================================================
   *  VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newCalendarioForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{
            
      return false;
    }
  
  }
  // ===================================================================
  // CARGAR CALENDARIO
  // ===================================================================
  cargarCalendario(){

    this.calendarioService.loadCalendario()
        .subscribe( ({calendarios}) => {

          this.events = [];
          
          calendarios.forEach(calendario => {

           // SET HOURS  
           let inicial;
           let final;    

           inicial = new Date(calendario.start);      
           const initial = new Date(inicial.getTime() + 1000 * 60 * 60 * 5);
           

           final = new Date(calendario.end);
           const end = new Date(final.getTime() + 1000 * 60 * 60 * 5);    
           // SET HOURS 
           
           this.events = [
             ...this.events,
             {
               title: calendario.title,
               start: addDays(setHours(setMinutes(new Date(initial), Number(initial.getMinutes())), Number(initial.getHours())), 0),
               color: colors.blue,
               actions: this.actions,
               user: calendario.user,
               calid: calendario.calid,
               resizable: {
                 beforeStart: true,
                 afterEnd: true,
                },
               end: addDays(setHours(setMinutes(new Date(end), Number(end.getMinutes())), Number(end.getHours())),0),
             },
           ];
                        
          });

        });

  }

  /** ================================================================
   *  ELIMINAR CALENDARIO
  ==================================================================== */
  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);    
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

}
