import { Injectable } from '@angular/core';
import { FsService } from 'ngx-fs';

const config_path = './agens-manager.json';

@Injectable({
  providedIn: 'root'
})
export class LocalConfigService {

  data: any = { "name": 'agens-manager01', "servers": [] };
  fs: any;

  constructor(
    private _fsService: FsService
  ) { 
    // if run by `ng serve`, fs is null (because not run by nodejs)
    this.fs = this._fsService.fs;
    // the _FsService contents is described here https://nodejs.org/api/fs.html
    if( this.fs ) this.readConfig();
    else console.log('ERROR: fs cannot be loding!!');
  }

  readConfig() {

    try {
      if( this.fs.existsSync(config_path) ){
        // file exists
        this.fs.readFile( config_path, ( error, data ) => {
          if ( error ) throw error;
          this.data = JSON.parse( data );
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
            console.log("fs: config init!")
          }
        );
      }
    } catch(err) {
      console.error(err)
    }

  }  

  get(key:string){
    return this.data[key];
  }

  // 무조건 쓴다 (동기화 따위는 없다)
  writeConfig(key:string, val:any){
    this.data[key] = val;
    if( this.fs ){
      this.fs.writeFile( config_path, JSON.stringify( this.data ), "utf-8",
        (err) => {
          if (err) throw err
          console.log(`fs: config is saved with '${key}'`);
        }
      );
    }
  }
}
