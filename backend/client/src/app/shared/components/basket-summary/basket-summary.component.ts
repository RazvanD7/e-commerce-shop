import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BasketService } from '../../../basket/basket.service';
import { Observable } from 'rxjs';
import { IBasket, IBasketItem } from '../../models/basket';

@Component({
  selector: 'app-basket-summary',
  standalone: false,
  templateUrl: './basket-summary.component.html',
  styleUrl: './basket-summary.component.scss'
})
export class BasketSummaryComponent implements OnInit {
  basket$: Observable<IBasket>;
  @Output() decrement:EventEmitter<IBasketItem> = new EventEmitter<IBasketItem>();
  @Output() increment:EventEmitter<IBasketItem> = new EventEmitter<IBasketItem>();
  @Output() remove:EventEmitter<IBasketItem> = new EventEmitter<IBasketItem>();
  @Input() isBasket = true;

  constructor (private basketService: BasketService){}

  ngOnInit(): void {
    this.basket$ = this.basketService.basket$;
  }
  decrementItemQuantity(item : IBasketItem){
    this.decrement.emit(item);
  }
  incrementItemQuantity(item : IBasketItem){
    this.increment.emit(item);
  }
  removeBasketItem(item : IBasketItem){
    this.remove.emit(item);
  }
}
