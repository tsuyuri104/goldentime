import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteName } from './classes/route-name';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: RouteName.LOGIN, pathMatch: 'full' },
  { path: RouteName.LOGIN, component: LoginComponent },
  { path: RouteName.REGISTER, component: RegisterComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: RouteName.LOGIN }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
