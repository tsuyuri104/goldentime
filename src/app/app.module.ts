import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuillModule } from 'ngx-quill';
import { ToastrModule } from 'ngx-toastr';
import { NgxDiffModule } from 'ngx-diff';

import { RegisterComponent } from './components/splitpage/register/register.component';
import { LoginComponent } from './components/fullscreenpage/login/login.component';
import { DailyDataComponent } from './components/splitpage/register/daily-data/daily-data.component';
import { MonthlyDataComponent } from './components/splitpage/register/monthly-data/monthly-data.component';
import { OverviewComponent } from './components/splitpage/overview/overview.component';
import { NavigationComponent } from './components/parts/navigation/navigation.component';
import { LOCALE_ID } from '@angular/core';
import localeJa from '@angular/common/locales/ja';
import { registerLocaleData } from '@angular/common';
import { HeaderComponent } from './components/parts/header/header.component';
import { FooterComponent } from './components/parts/footer/footer.component';
import { SplitDefaultComponent } from './components/splitpage/split-default/split-default.component';
import { FullscreenDefaultComponent } from './components/fullscreenpage/fullscreen-default/fullscreen-default.component';
import { SvgWriteComponent } from './components/svg/svg-write/svg-write.component';
import { SvgTableReportComponent } from './components/svg/svg-table-report/svg-table-report.component';
import { SvgConfoundedFaceComponent } from "./components/svg/svg-confounded-face/svg-confounded-face.component";
import { SvgSettingComponent } from './components/svg/svg-setting/svg-setting.component';
import { SvgDeleteComponent } from './components/svg/svg-delete/svg-delete.component';
import { SettingsComponent } from './components/splitpage/settings/settings.component';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { TimesagoPipe } from './pipes/timesago.pipe';
import { EmojiSparklingHeartComponent } from './components/emoji/emoji-sparkling-heart/emoji-sparkling-heart.component';
import { EmojiClapComponent } from './components/emoji/emoji-clap/emoji-clap.component';
import { EmojiThumbsUpComponent } from './components/emoji/emoji-thumbs-up/emoji-thumbs-up.component';
import { EmojiSpeechBalloonComponent } from './components/emoji/emoji-speech-balloon/emoji-speech-balloon.component';
import { SvgRoadSignComponent } from './components/svg/svg-road-sign/svg-road-sign.component';
import { CopyrightComponent } from './components/splitpage/copyright/copyright.component';
import { SvgLogComponent } from './components/svg/svg-log/svg-log.component';
import { SvgLockComponent } from './components/svg/svg-lock/svg-lock.component';
import { SvgUnlockComponent } from './components/svg/svg-unlock/svg-unlock.component';
import { AnalysisComponent } from './components/splitpage/analysis/analysis.component';
import { SvgAnalysisComponent } from './components/svg/svg-analysis/svg-analysis';

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
    SvgWriteComponent,
    SvgTableReportComponent,
    SvgConfoundedFaceComponent,
    SvgSettingComponent,
    SvgDeleteComponent,
    SettingsComponent,
    TimestampPipe,
    TimesagoPipe,
    EmojiSparklingHeartComponent,
    EmojiClapComponent,
    EmojiThumbsUpComponent,
    EmojiSpeechBalloonComponent,
    SvgRoadSignComponent,
    CopyrightComponent,
    SvgLogComponent,
    SvgLockComponent,
    SvgUnlockComponent,
    AnalysisComponent,
    SvgAnalysisComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    QuillModule.forRoot(),
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), // ToastrModule added
    NgxDiffModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'ja-JP' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
