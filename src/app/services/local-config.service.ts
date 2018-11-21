import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { FsService } from 'ngx-fs';

import { Observable, Subject } from 'rxjs';

const config_name = 'agens-manager.json';
declare var userPath: Function;


@Injectable({
  providedIn: 'root'
})
export class LocalConfigService {

  config_path: string;
  state$:Subject<string> = new Subject();
  data: any = { "name": 'agens-manager01'
              , "servers": [
                { "name": 'agens01', "url": 'http://localhost:8084' }
                , { "name": 'agens02', "url": 'http://localhost:8085' }
              ] };
  fs: any;

  constructor(
    private _electron: ElectronService,
    private _fsService: FsService
  ) { 
    if( this._electron.remote.app.getPath('userData') )
      this.config_path = this._electron.remote.app.getPath('userData') + '/' + config_name;
    else this.config_path = './' + config_name;
    console.log( 'configPath:', this.config_path );

    // if run by `ng serve`, fs is null (because not run by nodejs)
    this.fs = this._fsService.fs;
    // the _FsService contents is described here https://nodejs.org/api/fs.html
    setTimeout(()=>{
      if( this.fs ) this.readConfig();    
      else{
        console.log('ERROR: fs cannot be loding!!', this.data);
        this.state$.next('test');
      }
    }, 500);
  }

  init(){
    return this.state$;
  }

  readConfig(callback:Function=undefined) {

    if( this.fs ){
      try {
        if( this.fs.existsSync(this.config_path) ){
          // file exists
          this.fs.readFile( this.config_path, ( error, data ) => {
            if ( error ) throw error;
            this.data = JSON.parse( data );
            this.state$.next('ready');
            console.log( this.data );
          } );
        }
        else{
          // file not exists
          this.fs.writeFile( this.config_path,
            JSON.stringify( this.data ),
            "utf-8",
            (err) => {
              if (err) throw err
              this.state$.next('init');
              console.log("fs: config init!")
            }
          );
        }
      } catch(err) {
        console.error(err)
      }
    }
    else{
      console.log('ERROR: fs cannot be loding!!', this.data);
      this.state$.next('test');
    }
  }  

  get(key:string){
    return this.data[key];
  }

  // 무조건 쓴다 (동기화 따위는 없다)
  writeConfig(key:string, val:any, callback:Function = undefined){
    this.data[key] = val;
    if( this.fs ){
      this.fs.writeFile( this.config_path, JSON.stringify( this.data ), "utf-8",
        (err) => {
          if (err) throw err
          this.state$.next('saved');
          console.log(`fs: config is saved with '${key}'`);

          if( callback ) callback();
        }
      );
    }
    else{
      if( callback ) callback();
    }
  }
}
