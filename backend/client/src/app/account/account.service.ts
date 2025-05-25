import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, ReplaySubject, tap, catchError, of } from 'rxjs';
import { IUser } from '../shared/models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl= 'https://localhost:5202/api/';
  private currentUserSource = new BehaviorSubject<IUser | undefined>(undefined);
  currentUser$ = this.currentUserSource.asObservable();
  private rpSource = new ReplaySubject<IUser>(1);
  rp$ = this.rpSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  loadCurrentUser(token: string | null) {
    if(token === null)
    {
      this.currentUserSource.next(undefined);
      return of(undefined);
    }
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.get<IUser>(this.baseUrl + 'account', {headers}).pipe(
      map(user => {
        if(user){
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        } else {
          this.currentUserSource.next(undefined);
        }
        return user;
      }),
      catchError(error => {
        console.log(error);
        localStorage.removeItem('token');
        this.currentUserSource.next(undefined);
        return of(undefined);
      })
    );
  }

  login(value: any){
    return this.http.post<IUser>(this.baseUrl + 'account/login', value).pipe(
      tap(user => {
        if(user){
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
    );
  }
  register(value: any){
    return this.http.post<IUser>(this.baseUrl + 'account/register', value).pipe(
      tap(user => {
        if(user){
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
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
