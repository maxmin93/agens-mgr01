import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';

import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ElectronService } from 'ngx-electron';
import { LocalConfigService } from './services/local-config.service';

import { Observable, Subject, Subscription, interval } from 'rxjs';
import { tap, map, filter, concatAll, share, takeWhile } from 'rxjs/operators';

import { RegisterItemComponent } from './dialog/register-item/register-item.component';
import { DeleteItemComponent } from './dialog/delete-item/delete-item.component';

// ** 코드 참고
// https://coursetro.com/posts/code/125/Angular-5-Electron-Tutorial

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  state:string = 'loading';
  timer_max = 1.0;
  timer_curr = 0;

  state$:Subject<string>;
  title = 'AgensManager';
  servers = [];

  selected_item: any;
  item_name: string;
  item_url: string;

  constructor(
    private _electron: ElectronService,
    private _config: LocalConfigService,
    private _cd: ChangeDetectorRef,
    private _http: HttpClient,
    private _msg: MatSnackBar,
    public dialog: MatDialog
  ) {}   // DI

  ngOnInit(){
    this.state$ = this._config.init();

    this.state$.subscribe(x => {
      console.log('config state$:', x);
      this.state = x;
      if( x == 'ready' || x == 'test' ){     
        this.timer_curr = this.timer_max;   
        this.updateData();
      } 
    });
  }

  ngAfterViewInit(){
    // this.getMeta(this.servers[0]);

    let spinner:Observable<number> = interval(100);   
    spinner.pipe(
      takeWhile(_ => this.timer_curr < this.timer_max ),
      tap(i => this.timer_curr += 0.1)
    )
    .subscribe( val => console.log(val) );
  }

  showMessage(state:string, message:string) {
    this._msg.open(message, state, { duration: 4000, });
  }

  updateData(){
    this.title = this._config.get('name');

    let i = 0;
    this.servers = [...this._config.get('servers')];
    this.servers.forEach(item => {
      item['index'] = i++;
      item['datasource'] = { "jdbc_url": '', "name": '', "desc": '', };
      item['message'] = "";
      item['update_dt'] = undefined;

      this.updateItem(item);
    });

    Promise.resolve(null).then(()=>{
      this.showMessage('DONE', `loading server list (size=${this.servers.length})`);
    });    
  }

  ////////////////////////////////////////////////////////////

  openDialogRegister(): void {
    const dialogRef = this.dialog.open(RegisterItemComponent, {
      width: '250px',
      data: { name: '', url: '', index: this.servers.length }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The register dialog was closed:', result);
      if( !result ) return;
      if( result.name == '' || result.url == '' ){
        this.showMessage('WARNING', 'server name or url is empty. try again.');
        return;
      }

      this.servers.push(result);
      this._cd.detectChanges();

      this._config.writeConfig('servers', this.servers);
      this.showMessage('INFO', `server "${result.name}" was registered.`);
    });
  }

  openDialogDelete(item:any): void {
    const dialogRef = this.dialog.open(DeleteItemComponent, {
      width: '250px',
      data: { name: item.name, url: item.url }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The delete dialog was closed:', result);
      if( !result ) return;

      this.servers.splice(result.index,1);
      this._cd.detectChanges();

      this._config.writeConfig('servers', this.servers);
      this.showMessage('INFO', `server "${result.name}" was deregistered.`);
    });
  }

  launchWindow() {
    this._electron.shell.openExternal('https://coursetro.com');
  }

  connectItem(item:any){
    this._electron.shell.openExternal(item.url);
  }

  ////////////////////////////////////////////////////////////////

  updateItem(item:any){
    if( !item || !item.url ) return;

    const api = `${item.url}/api/core/schema`;
    let info$ = this._http.get<any>(api, {
        headers: new HttpHeaders({ 
          'Content-Type': 'application/json', 'Authorization': '1234567890' })
        })
        .pipe( concatAll(), filter(x => x.hasOwnProperty('group') && x['group'] == 'schema') );

    info$.subscribe(x => {
      console.log( x );
      item['datasource'] = x.hasOwnProperty('datasource') ? x['datasource'] : {};
      item['message'] = x.hasOwnProperty('message') ? x['message'] : {};
      item['update_dt'] = new Date();
    },
    err => {
      // this.showMessage('ERROR', err.message);
    },
    () => {
      this._cd.detectChanges();
    });
  }

  parseJdbcUrl(url:string){
    if( !url || url.length == 0 ) return '(not available)';
    let start = url.lastIndexOf('/');
    let end = url.lastIndexOf('?');
    return (start > 0) ? url.substring(start+1, (end > start) ? end : url.length) : url;
  }
}
