import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteName } from './consts/route-name';
import { FullscreenDefaultComponent } from './components/fullscreenpage/fullscreen-default/fullscreen-default.component';
import { LoginComponent } from './components/fullscreenpage/login/login.component';
import { CopyrightComponent } from './components/splitpage/copyright/copyright.component';
import { RegisterComponent } from './components/splitpage/register/register.component';
import { SettingsComponent } from './components/splitpage/settings/settings.component';
import { SplitDefaultComponent } from './components/splitpage/split-default/split-default.component';
import { AuthGuard } from './guards/auth.guard';
import { AnalysisComponent } from './components/splitpage/analysis/analysis.component';

const routes: Routes = [
  { path: '', redirectTo: RouteName.LOGIN, pathMatch: 'full' },
  { path: RouteName.LOGIN, component: FullscreenDefaultComponent, children: [{ path: '', component: LoginComponent }] },
  {
    path: '', component: SplitDefaultComponent, children: [
      { path: RouteName.REGISTER, component: RegisterComponent },
      { path: RouteName.SETTING, component: SettingsComponent },
      { path: RouteName.COPYRIGHT, component: CopyrightComponent },
      { path: RouteName.ANALYSIS, component: AnalysisComponent },
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
