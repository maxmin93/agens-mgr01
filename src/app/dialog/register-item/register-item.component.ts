import { Component, Inject, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface ItemData {
  url: string;
  name: string;
  index: number;
}

@Component({
  selector: 'app-register-item',
  templateUrl: './register-item.component.html',
  styleUrls: ['./register-item.component.css']
})
export class RegisterItemComponent implements OnInit {

  item: ItemData = undefined;

  constructor(
    public dialogRef: MatDialogRef<RegisterItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ItemData
  ){
    this.item = data;
  }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  onRegister(): void {
    this.dialogRef.close( this.item );
  }
}
