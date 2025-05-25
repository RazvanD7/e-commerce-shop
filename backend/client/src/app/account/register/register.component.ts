import { Component, OnInit } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router } from '@angular/router';
import { map, switchMap, debounceTime, distinctUntilChanged, finalize, delay } from 'rxjs/operators';
import { Observable, of, timer } from 'rxjs';
import { IUser } from '../../shared/models/user';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errors: string[];

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.createRegisterForm();
  }
  createRegisterForm(){
    this.registerForm = this.fb.group({
      displayName: [null, [Validators.required]],
      email: [null,
        [Validators.required, Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')],
        [this.validateEmailNotTaken()]
      ],
      password: [null,[Validators.required]]
    });
  }
   onSubmit()
  {
    this.accountService.register(this.registerForm.value).subscribe({
      next: response => {
        this.router.navigateByUrl('/shop');
      },
      error: error => {
        console.log(error);
        this.errors = Object.keys(error.error.errors).map(key => error.error.errors[key]);
      }
    });
  }
  validateEmailNotTaken(): (control: AbstractControl) => Observable<ValidationErrors | null> {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.invalid) {
        return of(null);
      }
      return this.accountService.checkEmailExists(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(emailExists => {
          return emailExists ? of({ emailExists: true }) : of(null);
        }),
        delay(1000),
        finalize(() => {
            // console.log('Email validation complete');
        })
      );
    };
  }
}
