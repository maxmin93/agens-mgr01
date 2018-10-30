# AngElectron

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.3.

## Development server

`npm run electron`
`npm run electron-aot`

Run `ng serve` for a dev server. 
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. 
The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Coding References

https://coursetro.com/posts/code/125/Angular-5-Electron-Tutorial
https://material.angular.io/components/card/examples

## Electron packager
https://www.christianengvall.se/electron-packager-tutorial/

### MacOS (darwin)
`electron-packager . --overwrite --platform=darwin --arch=x64 --icon=src/assets/icons/favicon-bn.icns --prune=true --out=release-builds`

### Windows (win32)
`electron-packager . electron-tutorial-app --overwrite --asar=true --platform=win32 --arch=ia32 --icon=src/assets/icons/favicon-bn.ico --prune=true --out=release-builds --version-string.CompanyName=Bn --version-string.FileDescription=Bitnine --version-string.ProductName="AgensBrowser Manager"`
