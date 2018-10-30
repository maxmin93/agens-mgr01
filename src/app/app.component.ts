import { Component } from '@angular/core';

import { ElectronService } from 'ngx-electron';

// ** 코드 참고
// https://coursetro.com/posts/code/125/Angular-5-Electron-Tutorial

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ang-electron';

  constructor(
    private _electronService: ElectronService
  ) {}   // DI

  launchWindow() {
    this._electronService.shell.openExternal('https://coursetro.com');
  }

}
