import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteName } from './classes/route-name';
import { FullscreenDefaultComponent } from './components/fullscreenpage/fullscreen-default/fullscreen-default.component';
import { LoginComponent } from './components/fullscreenpage/login/login.component';
import { CopyrightComponent } from './components/splitpage/copyright/copyright.component';
import { OverviewComponent } from './components/splitpage/overview/overview.component';
import { RegisterComponent } from './components/splitpage/register/register.component';
import { ReportDifferComponent } from './components/splitpage/report-differ/report-differ.component';
import { ReportEditorComponent } from './components/splitpage/report-editor/report-editor.component';
import { ReportListComponent } from './components/splitpage/report-list/report-list.component';
import { ReportViewerComponent } from './components/splitpage/report-viewer/report-viewer.component';
import { SettingsComponent } from './components/splitpage/settings/settings.component';
import { SplitDefaultComponent } from './components/splitpage/split-default/split-default.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: RouteName.LOGIN, pathMatch: 'full' },
  { path: RouteName.LOGIN, component: FullscreenDefaultComponent, children: [{ path: '', component: LoginComponent }] },
  {
    path: '', component: SplitDefaultComponent, children: [
      { path: RouteName.REGISTER, component: RegisterComponent },
      { path: RouteName.OVERVIEW, component: OverviewComponent },
      { path: RouteName.SETTING, component: SettingsComponent },
      { path: RouteName.REPORT, component: ReportListComponent },
      { path: RouteName.EDITOR + '/:id', component: ReportEditorComponent },
      { path: RouteName.VIEWER + '/:id', component: ReportViewerComponent },
      { path: RouteName.DIFFER + '/:id', component: ReportDifferComponent },
      { path: RouteName.COPYRIGHT, component: CopyrightComponent },
    ]
    , canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: RouteName.LOGIN }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "top" })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
