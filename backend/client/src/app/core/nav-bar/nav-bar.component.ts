import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IBasket } from '../../shared/models/basket';
import { BasketService } from '../../basket/basket.service';
import { IUser } from '../../shared/models/user';
import { AccountService } from '../../account/account.service';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {
basket$: Observable<IBasket>;
currentUser$: Observable<IUser | undefined>;
constructor(private basketService: BasketService, private accountService: AccountService){}

ngOnInit(): void {
  this.basket$ = this.basketService.basket$;
  this.currentUser$ = this.accountService.currentUser$;
}

logout(){
  this.accountService.logout();
}
}
