import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  QueryList,
  ViewChildren,
  OnDestroy,
} from '@angular/core';
import { trigger, state, style } from '@angular/animations';
import { fromEvent, merge, of, Subscription } from 'rxjs';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
 

@Component({
  selector: 'app-works-field',
  templateUrl: './works-field.component.html',
  styleUrls: ['./works-field.component.scss'],
  animations: [
    trigger('selectedFolder', [
      state(
        'selected',
        style({
          background: "url('/assets/icons/folder-icon-2-open.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPositionX: '3px',
          backgroundPositionY: '10px',
          color: 'red'
        })
      ),
      state(
        'unselected',
        style({
          background: " url('/assets/icons/folder-icon-2.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPositionX: '3px',
          backgroundPositionY: '10px'
        })
      )
    ])
  ]
})
export class WorksFieldComponent implements AfterViewInit , OnDestroy{
  foldersList = [
    { name: 'First' },
    { name: 'Second' },
    { name: 'Third' },
    { name: 'Fourth' }
  ];
  selectedFolders: string = '';
  selectedArea = {
    startPointX: 0,
    startPointY: 0,
    width: 0,
    height: 0
  };
  selectedAreaStyle = false;

  @ViewChild('workField') workField: ElementRef;
  @ViewChild('selectedZone') selectedZone: ElementRef;
  @ViewChildren('folder') folder: QueryList<ElementRef<HTMLElement>>;

  folders: Subscription;
  area: Subscription;
  areaSelected: Subscription;

  ngAfterViewInit() {
    this.area = fromEvent<MouseEvent>(this.workField.nativeElement, 'mousedown')
      .pipe(
        tap(mousedown => {
          this.selectedArea.startPointX = mousedown.x;
          this.selectedArea.startPointY = mousedown.y;
          this.selectedAreaStyle = true;
        }),
        switchMap(mousedown =>
          fromEvent<MouseEvent>(this.workField.nativeElement, 'mousemove').pipe(
            startWith(mousedown),
            takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
            map(move => ({
              startPointX: mousedown.offsetX,
              startPointY: mousedown.offsetY,
              width: move.x - mousedown.x,
              height: move.y - mousedown.y
            }))
          )
        ),
        tap(data => this.selectedArea = data)
      )
      .subscribe();

     this.areaSelected = fromEvent<MouseEvent>(document, 'mouseup').pipe(
       tap(()=> this.selectedAreaStyle = false)
       ).subscribe()
 
      this.folders = fromEvent<MouseEvent>(this.workField.nativeElement, 'mousedown').pipe(
        switchMap(()=> merge( fromEvent<MouseEvent>(this.workField.nativeElement, 'mousemove')).pipe(
          takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
          switchMap(() => of(this.selectedZone)),
          map(area =>
            this.folder
            .toArray()
            .filter(item => item.nativeElement.offsetLeft + item.nativeElement.offsetWidth > area.nativeElement.offsetLeft &&
                            item.nativeElement.offsetLeft < area.nativeElement.offsetLeft + area.nativeElement.offsetWidth &&
                            item.nativeElement.offsetTop + item.nativeElement.offsetHeight > area.nativeElement.offsetTop &&
                            item.nativeElement.offsetTop < area.nativeElement.offsetTop + area.nativeElement.offsetHeight
                    )
                    .map(item => item.nativeElement.innerText)
                    .join(', ')),
            tap(data=> this.selectedFolders = data)
            )),
        ) 
        .subscribe();
  }

  public parametrsForSelectedZone() {
    const width = this.workField?.nativeElement.offsetWidth;
    const height = this.workField?.nativeElement.offsetHeight;

    if (this.selectedArea.width > 0 && this.selectedArea.height > 0) {
      return {
        width: `${this.selectedArea.width}px`,
        height: `${this.selectedArea.height}px`,
        left: ` ${this.selectedArea.startPointX}px`,
        top: `${this.selectedArea.startPointY}px`
      };
    }

    if (this.selectedArea.width < 0 && this.selectedArea.height > 0) {
      return {
        width: `${this.selectedArea.width * -1}px`,
        height: `${this.selectedArea.height}px`,
        right: ` ${width - this.selectedArea.startPointX}px`,
        top: `${this.selectedArea.startPointY}px`
      };
    }

    if (this.selectedArea.width > 0 && this.selectedArea.height < 0) {
      return {
        width: `${this.selectedArea.width}px`,
        height: `${this.selectedArea.height * -1}px`,
        left: ` ${this.selectedArea.startPointX}px`,
        bottom: `${height - this.selectedArea.startPointY}px`
      };
    } 
    else {
      return {
        width: `${this.selectedArea.width * -1}px`,
        height: `${this.selectedArea.height * -1}px`,
        right: ` ${width - this.selectedArea.startPointX}px`,
        bottom: `${height - this.selectedArea.startPointY}px`
      };
    }
  }

  selectedFolderStyle(name: string) {
    return this.selectedFolders.indexOf(name) + 1;
  }

  ngOnDestroy() {
    this.folders.unsubscribe();
    this.area.unsubscribe();
    this.areaSelected.unsubscribe();
  }
}
