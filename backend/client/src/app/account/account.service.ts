import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, ReplaySubject, tap, catchError, of, Observable } from 'rxjs';
import { IUser } from '../shared/models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl= 'https://localhost:5202/api/';
  private currentUserSource = new ReplaySubject<IUser | undefined>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  loadCurrentUser(token: string | null): Observable<IUser | undefined> {
    if (token === null) {
      this.currentUserSource.next(undefined);
      return of(undefined);
    }

    localStorage.setItem('token', token);

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.get<IUser>(this.baseUrl + 'account', {headers}).pipe(
      map(user => {
        if(user){
          this.currentUserSource.next(user);
          return user;
        } else {
          this.currentUserSource.next(undefined);
          return undefined;
        }
      }),
      catchError(error => {
        console.log(error);
        this.currentUserSource.next(undefined);
        return of(undefined);
      })
    );
  }

  login(value: any): Observable<void> {
    return this.http.post<IUser>(this.baseUrl + 'account/login', value).pipe(
      tap(user => {
        if(user){
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      }),
      map(() => {})
    );
  }
  register(value: any): Observable<void> {
    return this.http.post<IUser>(this.baseUrl + 'account/register', value).pipe(
      tap(user => {
        if(user){
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      }),
      map(() => {})
    );
  }

  logout(){
    localStorage.removeItem('token');
    this.currentUserSource.next(undefined);
    this.router.navigateByUrl('/');
  }

  checkEmailExists(email: string)
  {
    return this.http.get(this.baseUrl + '/account/emailexists?email=' + email);
  }

  
}
