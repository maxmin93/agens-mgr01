import { Component, Inject, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface ItemData {
  url: string;
  name: string;
  index: number;
}

@Component({
  selector: 'app-delete-item',
  templateUrl: './delete-item.component.html',
  styleUrls: ['./delete-item.component.css']
})
export class DeleteItemComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ItemData
  ){
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
