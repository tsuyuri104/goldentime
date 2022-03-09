import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RouteName } from '../classes/route-name';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  //#region コンストラクタ

  constructor(private sAuth: AuthService, private router: Router) {

  }

  //#endregion

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.sAuth.user === null || this.sAuth.user === undefined) {
      this.router.navigateByUrl(RouteName.LOGIN);
    }

    return !(this.sAuth.user === null || this.sAuth.user === undefined);
  }
}
