import { Injectable } from '@angular/core';
import { FsService } from 'ngx-fs';

import { Observable, Subject } from 'rxjs';

const config_path = './agens-manager.json';

@Injectable({
  providedIn: 'root'
})
export class LocalConfigService {

  state$:Subject<string> = new Subject();
  data: any = { "name": 'agens-manager01'
              , "servers": [
                { "name": 'agens01', "url": 'http://localhost:8084' }
                , { "name": 'agens02', "url": 'http://localhost:8085' }
              ] };
  fs: any;

  constructor(
    private _fsService: FsService
  ) { 
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
        if( this.fs.existsSync(config_path) ){
          // file exists
          this.fs.readFile( config_path, ( error, data ) => {
            if ( error ) throw error;
            this.data = JSON.parse( data );
            this.state$.next('ready');
            console.log( this.data );
          } );
        }
        else{
          // file not exists
          this.fs.writeFile( config_path,
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
      this.fs.writeFile( config_path, JSON.stringify( this.data ), "utf-8",
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
