import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-works-field',
  templateUrl: './works-field.component.html',
  styleUrls: ['./works-field.component.scss']
})
export class WorksFieldComponent implements OnInit {

  foldersList = [
    {name: 'First'},
    {name: 'Second'},
    {name: 'Third'},
    {name: 'Fourth'},
  ];
  selectedFoldersList: String[] = []

  constructor() {
  }

  ngOnInit(): void {
  }

}
