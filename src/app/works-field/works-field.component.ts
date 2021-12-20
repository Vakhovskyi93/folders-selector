import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {  fromEvent, of, Subscription } from 'rxjs';

import {
  auditTime,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

@Component({
  selector: 'app-works-field',
  templateUrl: './works-field.component.html',
  styleUrls: ['./works-field.component.scss'],
})
export class WorksFieldComponent implements AfterViewInit {
  foldersList = [
    { name: 'First' },
    { name: 'Second' },
    { name: 'Third' },
    { name: 'Fourth' },
  ];
  selectedFolders: string = '';
  selectedArea = {
    startPointX:0, 
    startPointY:0, 
    width:0, 
    height:0 };

  @ViewChild('workField') workField!: ElementRef;
  @ViewChild('selectedZone') selectedZone!: ElementRef;
  @ViewChildren('folder') folder!: QueryList<ElementRef<HTMLElement>>;

  folders!: Subscription;
  area!: Subscription;

  ngAfterViewInit() {
   this.folders = fromEvent<MouseEvent>(this.workField.nativeElement, 'mousedown')
      .pipe(
        switchMap(() =>
          fromEvent<MouseEvent>(this.workField.nativeElement, 'mousemove').pipe(
            switchMap(() => of(this.selectedZone)),
            map((area) =>
              this.folder
                .toArray()
                .filter(
                  (item) =>(
                    item.nativeElement.offsetLeft + item.nativeElement.offsetWidth > area.nativeElement.offsetLeft &&
                    item.nativeElement.offsetLeft < area.nativeElement.offsetLeft + area.nativeElement.offsetWidth &&
                    item.nativeElement.offsetTop + item.nativeElement.offsetHeight > area.nativeElement.offsetTop &&
                    item.nativeElement.offsetTop < area.nativeElement.offsetTop + area.nativeElement.offsetHeight)
                )
            ),
            map(i => i.map(item => item.nativeElement.innerText).join(', '))
          )
        )
      )
      .subscribe(data => this.selectedFolders = data);

    this.area = fromEvent<MouseEvent>(this.workField.nativeElement, 'mousedown')
      .pipe(
        tap((mousedown) => { this.selectedArea.startPointX = mousedown.offsetX; this.selectedArea.startPointY = mousedown.offsetY}),
        switchMap((mousedown) =>
          fromEvent<MouseEvent>(this.workField.nativeElement, 'mousemove').pipe(
            startWith(mousedown),
            takeUntil(fromEvent<MouseEvent>(this.workField.nativeElement, 'mouseup')),
            map((move) => (
              {
                startPointX: mousedown.offsetX,
                startPointY: mousedown.offsetY,
                width: move.x - mousedown.x ,
                height: move.y - mousedown.y
              }
            ))
          )
        )
      )
      .subscribe(data => this.selectedArea = data);
  }

  ngOnDestroy(){
    this.folders.unsubscribe();
    this.area.unsubscribe();
  }

  public parametrsForSelectedZone() {
    let shapesCoordinates = {};
    const width = this.workField?.nativeElement.offsetWidth;
    const height = this.workField?.nativeElement.offsetHeight;

    if (this.selectedArea.width > 0 && this.selectedArea.height > 0) {
      return shapesCoordinates = {
        width: `${this.selectedArea.width}px`,
        height: `${this.selectedArea.height}px`,
        left: ` ${this.selectedArea.startPointX}px`,
        top: `${this.selectedArea.startPointY}px`
      };
    }

    if (this.selectedArea.width < 0 && this.selectedArea.height > 0) {
      return shapesCoordinates = {
        width: `${this.selectedArea.width * -1}px`,
        height: `${this.selectedArea.height}px`,
        right: ` ${width - this.selectedArea.startPointX}px`,
        top: `${this.selectedArea.startPointY}px`
      };
    }
    
    if (this.selectedArea.width > 0 && this.selectedArea.height < 0) {
      return shapesCoordinates = {
        width: `${this.selectedArea.width}px`,
        height: `${this.selectedArea.height * -1}px`,
        left: ` ${this.selectedArea.startPointX}px`,
        bottom: `${height - this.selectedArea.startPointY}px`
      };
    }

    else  {
      return shapesCoordinates = {
        width: `${this.selectedArea.width * -1}px`,
        height: `${this.selectedArea.height * -1}px`,
        right: ` ${width - this.selectedArea.startPointX}px`,
        bottom: `${height - this.selectedArea.startPointY}px`
      };
    }
  }

  selectedFolderStyle(name:string){
    return this.selectedFolders.indexOf(name) + 1;
  }
}
