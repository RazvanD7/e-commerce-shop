import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { AccountService } from '../../account/account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private accountService: AccountService, private router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.accountService.currentUser$.pipe(
      tap(auth => {
        if(!auth) {
          this.router.navigate(['account/login'], {queryParams: {returnUrl: state.url}});
        }
      }),
      map(auth => !!auth)
    );
  }
}
