import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { AccountService } from '../../account/account.service';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private accountService: AccountService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return this.accountService.loadCurrentUser(token).pipe(
        switchMap(() => this.accountService.currentUser$), // Switch to currentUser$ after loadCurrentUser completes
        map(auth => {
          if (auth) {
            return true;
          } else {
            this.router.navigate(['/account/login'], {queryParams: {returnUrl: state.url}});
            return false;
          }
        }),
        take(1) // Ensure the guard completes after the first emission post-load
      );
    } else {
      // Allow the route on the server side during SSR, client-side guard will handle redirect if not authenticated
      return of(true);
    }
  }
  
}
