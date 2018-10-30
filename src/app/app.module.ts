;
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { NgxElectronModule } from 'ngx-electron';
import  {NgxFsModule } from 'ngx-fs';

import { HttpClientModule } from '@angular/common/http';

// Material : 이거 하나면 하위 모듈들 모두 커버 되는듯..
import { CdkTableModule } from '@angular/cdk/table';
import {
  MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonModule, MatButtonToggleModule,
  MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule,
  MatDividerModule, MatExpansionModule, MatGridListModule, MatIconModule, MatInputModule,
  MatListModule, MatMenuModule, MatNativeDateModule, MatPaginatorModule, MatProgressBarModule,
  MatProgressSpinnerModule, MatRadioModule, MatRippleModule, MatSelectModule, MatSidenavModule,
  MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule, MatStepperModule,
  MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule
} from '@angular/material';

import { LocalConfigService } from './services/local-config.service';

import { AppComponent } from './app.component';
import { RegisterItemComponent } from './dialog/register-item/register-item.component';
import { DeleteItemComponent } from './dialog/delete-item/delete-item.component';

@NgModule({
  declarations: [
    AppComponent,

    RegisterItemComponent,
    DeleteItemComponent
  ],
  imports: [    
    BrowserModule,
    BrowserAnimationsModule,

    FormsModule,
    ReactiveFormsModule,
    
    NgxElectronModule,
    NgxFsModule,

    HttpClientModule,

    CdkTableModule,
    MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonModule, MatButtonToggleModule,
    MatCardModule, MatCheckboxModule, MatChipsModule, MatStepperModule, MatDatepickerModule,
    MatDialogModule, MatDividerModule, MatExpansionModule, MatGridListModule, MatIconModule,
    MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule, MatPaginatorModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, MatRippleModule, MatSelectModule,
    MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule,
    MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule,
  ],
  providers: [
    LocalConfigService
  ],
  entryComponents: [
    RegisterItemComponent,
    DeleteItemComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
