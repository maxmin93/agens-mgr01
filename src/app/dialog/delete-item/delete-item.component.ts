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

  item:ItemData = undefined;

  constructor(
    public dialogRef: MatDialogRef<DeleteItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ItemData
  ){
    this.item = data;
  }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  onDelete(): void {
    this.dialogRef.close( this.item );
  }
}
