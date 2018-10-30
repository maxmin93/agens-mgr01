import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ElectronService } from 'ngx-electron';
import { LocalConfigService } from './services/local-config.service';

import { RegisterItemComponent } from './dialog/register-item/register-item.component';
import { DeleteItemComponent } from './dialog/delete-item/delete-item.component';

// ** 코드 참고
// https://coursetro.com/posts/code/125/Angular-5-Electron-Tutorial

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'ang-electron';
  
  selected_item: any;
  item_name: string;
  item_url: string;

  constructor(
    private _electronService: ElectronService,
    private _config: LocalConfigService,
    public dialog: MatDialog
  ) {}   // DI

  ngOnInit(){
    this.title = this._config.get('name');
  }

  openDialogRegister(): void {
    const dialogRef = this.dialog.open(RegisterItemComponent, {
      width: '250px',
      data: { name: this.item_name, url: this.item_url }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The register dialog was closed:', result);
      this.selected_item = result;
    });
  }

  openDialogDelete(): void {
    const dialogRef = this.dialog.open(DeleteItemComponent, {
      width: '250px',
      data: { name: this.item_name, url: this.item_url }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The delete dialog was closed:', result);
      this.selected_item = result;
    });
  }

  launchWindow() {
    this._electronService.shell.openExternal('https://coursetro.com');
  }

}
