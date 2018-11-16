import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';

import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ElectronService } from 'ngx-electron';
import { LocalConfigService } from './services/local-config.service';

import { Observable, Subject, Subscription, interval, of } from 'rxjs';
import { tap, map, filter, concatAll, share, takeWhile, timeout, catchError } from 'rxjs/operators';

import { RegisterItemComponent } from './dialog/register-item/register-item.component';
import { DeleteItemComponent } from './dialog/delete-item/delete-item.component';

// ** 코드 참고
// https://coursetro.com/posts/code/125/Angular-5-Electron-Tutorial

// ** HEALTH DTO class
// ==> net.bitnine.agensbrowser.bundle.persistence.outer.model.HealthType
const HEALTH_PROPS = [
  "product_version",              //: "1.3",
  "user_name",                    //: "agraph",
  "established_connections",      //: 5,
  "idle_connections",             //: 5,
  "description",                  //: "sample01_graph, labels.size=19 (8/11), relations=11, isDirty=false",
  "busy_connections",             //: 0,
  "jdbc_url",                     //: "jdbc:postgresql://27.117.163.21:15602/northwind?ApplicationName=AgensWeb13",
  "product_name",                 //: "AgensBrowser-web",
  "test_time",                    //: "2018-11-15 17:57:15",
  "cp_type",                      //: "hikari",
  "schema_image",                 //: 
  "active_sessions",              //: 1,
  "is_closed",                    //: false
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  state:string = 'loading';
  timer_max = 1.0;
  timer_curr = 0;
  handler_timer:Subscription;

  state$:Subject<string>;
  title = 'AgensManager';
  servers = [];
  handlers_health:Subscription[] = [];

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
      console.log('init state$:', x);
      this.state = x;
      if( x == 'ready' || x == 'test' ){     
        this.timer_curr = this.timer_max;
        if( this.handler_timer ){
          this.handler_timer.unsubscribe();
          this.handler_timer = undefined;
        }

        this.updateData();        // load server-list
        this.checker_start();     // health-checker start!!
      } 
    });
  }

  ngAfterViewInit(){
    // this.getMeta(this.servers[0]);

    let spinner$:Observable<number> = interval(100);
    this.handler_timer = spinner$.pipe(
      takeWhile(_ => this.timer_curr < this.timer_max ),
      tap(i => this.timer_curr += 0.1)
    )
    .subscribe();
  }

  ngOnDestroy(){
    this.closeHandlers();
    if( this.handler_timer ){
      this.handler_timer.unsubscribe();
      this.handler_timer = undefined;
    }
  }

  showMessage(state:string, message:string) {
    setTimeout(()=>{
      this._msg.open(message, state, { duration: 2500, });
    }, 100);
  }

  private closeHandlers(){
    this.handlers_health.forEach(x => {
      if( x ) x.unsubscribe();
    });
    this.handlers_health = [];
  }

  reloadList(){
    this.state = 'loading';
    this._config.readConfig();
    this.showMessage('INFO', `Wait until loading server list ...!`);
  }

  checker_start(){
    let checker$:Observable<number> = interval(1000*this.servers.length + 1000);
    this.handler_timer = checker$.pipe(
      takeWhile(_ => ['ready','test'].includes(this.state) ),
    )
    .subscribe( val => {
      // console.log( '** health checker: '+val);
      this.servers.forEach(item => {
        this.handlers_health[item['index']] = this.updateItem(item);
      });
      this._cd.detectChanges();
    });
  }

  ////////////////////////////////////////////////////////////

  openDialogRegister(): void {
    const dialogRef = this.dialog.open(RegisterItemComponent, {
      width: '250px',
      data: { name: '', url: 'http://', index: this.servers.length }
    });

    dialogRef.afterClosed().subscribe(result => {
      if( !result ) return;
      if( result.name == '' || result.url == '' ){
        this.showMessage('WARNING', 'server name or url is empty. try again.');
        return;
      }
      this.state = 'loading';

      this.servers.push(result);
      this._cd.detectChanges();

      this._config.writeConfig('servers', this.servers, () => this.updateData() );
      this.showMessage('INFO', `server "${result.name}" was registered.`);
    });
  }

  openDialogDelete(item:any): void {
    const dialogRef = this.dialog.open(DeleteItemComponent, {
      width: '250px',
      data: { name: item['name'], url: item['url'], index: item['index'] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if( !result ) return;
      this.state = 'loading';

      this.servers.splice(result.index, 1);
      this._cd.detectChanges();

      this._config.writeConfig('servers', this.servers, () => this.updateData() );
      this.showMessage('INFO', `server "${result.name}" was deregistered.`);
    });
  }

  launchWindow() {
    if( this._electron.shell ) this._electron.shell.openExternal('https://bitnine.net');
    else this.showMessage('WARNING', `"Open External" API cannot work correctly.`);
  }

  connectItem(item:any){
    if( this._electron.shell ) this._electron.shell.openExternal(item.url);
    else this.showMessage('WARNING', `"Open External" API cannot work correctly.`);
  }

  ////////////////////////////////////////////////////////////////

  updateData(){
    this.closeHandlers();

    this.title = this._config.get('name');   
    let temp = [...this._config.get('servers')];

    temp.forEach( (item, index) => {
      item['index'] = index;
      item['jdbc_url'] = '(unknown)';
      item['description'] = "";
      item['state'] = 'off';
    });

    this.servers = [...temp];
    this.state = 'ready';
    this._cd.detectChanges();

    this.servers.forEach(item => {
      this.handlers_health.push( this.updateItem(item) );
    });
    
    // Promise.resolve(null).then(()=>{
    //   this.showMessage('DONE', `loading server list (size=${this.servers.length})`);
    // });    
  }

  updateItem(item:any):Subscription{
    if( !item || !item.url ) return;

    const api = `${item.url}/api/core/health`;
    let info$ = this._http.get<any>(api, {
        headers: new HttpHeaders({ 
          'Content-Type': 'application/json'})
        })
        .pipe( 
          timeout(1000),
          catchError(e => {
            // console.log("catchError: ", e);
            // 서버 무응답 ==> status: 0, statusText: "Unknown Error"
            return of({ group: "health", state: "off", jdbc_url: '(ERR_CONNECTION)',
                          description: `server '${item.name}' is not ready (off)` });
          }),
          filter(x => x.hasOwnProperty('group') && x['group'] == 'health')
        );

    let handler:Subscription = info$.subscribe(x => {
      HEALTH_PROPS.forEach(k => {
        item[k] = undefined;
        if( x.hasOwnProperty(k) ) item[k] = x[k];
      });
      // determine state : normal or error
      if( item['jdbc_url'] == '(ERR_CONNECTION)' ) item['state'] = 'off';
      else if( item['is_closed']==true             // db is closed
          || item['idle_connections']==0      // not enough connection
          || !item['test_time'] )             // cannot execute query
           item['state'] = 'error';
      else item['state'] = 'normal';
    },
    err => {
      console.log( 'ERROR:', item, err );
      item['jdbc_url'] = '(ERR_CONNECTION)';
      item['description'] = `ERROR: ${err.message}`;
      item['state'] = 'off';
    },
    () => {
      this._cd.detectChanges();
    });

    return handler;
  }

  parseJdbcUrl( jdbc_url:any ){
    if( !jdbc_url || jdbc_url.length == 0 ) return '(not available)';

    let start = jdbc_url.lastIndexOf('/');
    let end = jdbc_url.lastIndexOf('?');
    return (start > 0) ? jdbc_url.substring(start+1, (end > start) ? end : jdbc_url.length) : jdbc_url;
  }
}
