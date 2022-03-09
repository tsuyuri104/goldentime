import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';

import { RegisterComponent } from './components/splitpage/register/register.component';
import { LoginComponent } from './components/fullscreenpage/login/login.component';
import { DailyDataComponent } from './components/daily-data/daily-data.component';
import { MonthlyDataComponent } from './components/monthly-data/monthly-data.component';
import { OverviewComponent } from './components/splitpage/overview/overview.component';
import { NavigationComponent } from './components/parts/navigation/navigation.component';
import { LOCALE_ID } from '@angular/core';
import localeJa from '@angular/common/locales/ja';
import { registerLocaleData } from '@angular/common';
import { HeaderComponent } from './components/parts/header/header.component';
import { FooterComponent } from './components/parts/footer/footer.component';
import { SplitDefaultComponent } from './components/splitpage/split-default/split-default.component';
import { FullscreenDefaultComponent } from './components/fullscreenpage/fullscreen-default/fullscreen-default.component';
import { WriteComponent } from './components/svg/write/write.component';
import { TableReportComponent } from './components/svg/table-report/table-report.component';

registerLocaleData(localeJa);

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    DailyDataComponent,
    MonthlyDataComponent,
    OverviewComponent,
    NavigationComponent,
    HeaderComponent,
    FooterComponent,
    SplitDefaultComponent,
    FullscreenDefaultComponent,
    WriteComponent,
    TableReportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'ja-JP' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
