import { Injectable } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RouteName } from '../classes/route-name';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  //#region コンストラクタ

  constructor(private router: Router) {

  }

  //#endregion

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const auth = getAuth();
    const user = auth.currentUser;

    if (user === null) {
      this.router.navigate([RouteName.LOGIN]);
    }
    return !(user === null);
  }
}
