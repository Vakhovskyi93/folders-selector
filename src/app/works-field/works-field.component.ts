import {Component, ElementRef, OnInit, AfterViewInit, ViewChild, QueryList, ViewChildren} from '@angular/core';
import { fromEvent, Subject} from "rxjs";
import { last, map, share, startWith, switchMap, tap} from "rxjs/operators";


export type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;


@Component({
  selector: 'app-works-field',
  templateUrl: './works-field.component.html',
  styleUrls: ['./works-field.component.scss']
})
export class WorksFieldComponent implements OnInit, AfterViewInit {

  foldersList = [
    {name: 'First'},
    {name: 'Second'},
    {name: 'Third'},
    {name: 'Fourth'},
  ];
  selectedFoldersList: String[] = []

  @ViewChild('selectArea') selectArea!: ElementRef;
  @ViewChildren("folder")
  folder!: QueryList<ElementRef<HTMLElement>>;

  private readonly areas$$ = new Subject<HTMLElement>();


  constructor() {
  }


  ngOnInit(): void {}

  ngAfterViewInit() {
    fromEvent<MouseEvent>(this.selectArea.nativeElement, 'mousedown').pipe(
      switchMap( mousedown =>fromEvent<MouseEvent>(this.selectArea.nativeElement, 'mousemove').pipe(
          startWith(mousedown),
          tap((i)=>console.log(i, mousedown, 'mousedown')),
          switchMap(()=>  fromEvent<MouseEvent>(this.selectArea.nativeElement, 'mouseup')),
          map(move => ({
              x: mousedown.offsetX,
              y: mousedown.offsetY,
              width: move.offsetX - mousedown.offsetX,
              height: move.offsetY - mousedown.offsetY
            }
          )),
          tap((i)=>console.log(i)),

      )



      ),

    ).subscribe(i => console.log(i, 'i'))


  }


}
