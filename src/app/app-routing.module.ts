import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteName } from './classes/route-name';
import { FullscreenDefaultComponent } from './components/fullscreenpage/fullscreen-default/fullscreen-default.component';
import { LoginComponent } from './components/fullscreenpage/login/login.component';
import { OverviewComponent } from './components/splitpage/overview/overview.component';
import { RegisterComponent } from './components/splitpage/register/register.component';
import { SplitDefaultComponent } from './components/splitpage/split-default/split-default.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: RouteName.LOGIN, pathMatch: 'full' },
  { path: RouteName.LOGIN, component: FullscreenDefaultComponent, children: [{ path: '', component: LoginComponent }] },
  {
    path: '', component: SplitDefaultComponent, children: [
      { path: RouteName.REGISTER, component: RegisterComponent },
      { path: RouteName.OVERVIEW, component: OverviewComponent }]
    , canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: RouteName.LOGIN }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
