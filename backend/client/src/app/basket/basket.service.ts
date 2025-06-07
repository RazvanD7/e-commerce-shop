import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Basket, IBasket, IBasketItem, IBasketTotals } from '../shared/models/basket';
import { response } from 'express';
import { IProduct } from '../shared/models/product';
import { isPlatformBrowser } from '@angular/common';
import { IDeliveryMethod } from '../shared/models/deliveryMethod';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  baseUrl = 'https://localhost:5202/api/';
  private basketSource = new BehaviorSubject<IBasket>(new Basket());
  basket$ = this.basketSource.asObservable();
  private basketTotalSource = new BehaviorSubject<IBasketTotals>({shipping: 0, total: 0, subtotal: 0});
  basketTotal$ = this.basketTotalSource.asObservable();
  shipping = 0;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  createPaymentIntent(){
    return this.http.post<IBasket>(this.baseUrl + 'payments/' + this.getCurrentBasketValue().id, {}).pipe(
      map((basket: IBasket) => {
        this.basketSource.next(basket);
        console.log(this.getCurrentBasketValue());
      })
    );
  }

  setShippingPrice(deliveryMethod: IDeliveryMethod)
  {
    this.shipping = deliveryMethod.price;
    const basket = this.getCurrentBasketValue();
    basket.deliveryMethodId = deliveryMethod.id;
    basket.shippingPrice = deliveryMethod.price;
    this.calculateTotal();
    this.setBasket(basket);
  }

  getBasket(id: string){
    return this.http.get<IBasket>(this.baseUrl + 'basket?id=' + id)
    .pipe(
      map((basket: IBasket) => {
        this.basketSource.next(basket);
        this.shipping = basket.shippingPrice ?? 0;
        this.calculateTotal();
      })
    );
  }

  setBasket(basket: IBasket){
    return this.http.post<IBasket>(this.baseUrl + 'basket', basket).subscribe((response: IBasket) => {
      this.basketSource.next(response);
      this.calculateTotal();
    }, error => {
      console.log(error);
    });
  }

  getCurrentBasketValue(){
    return this.basketSource.value;
  }

  addItemToBasket(item: IProduct, quantity = 1){
    const itemToAdd: IBasketItem = this.mapProductItemToBasketItem(item, quantity);
    let basket = this.getCurrentBasketValue();

    // Check if there is a basket ID in localStorage, if not, create a new basket
    if (isPlatformBrowser(this.platformId) && !localStorage.getItem('basket_id')) {
        basket = this.createBasket();
    } else if (!basket) { // Fallback if not in browser or localStorage check fails for some reason
        basket = this.createBasket();
    }
    basket.items = this.addOrUpdateItem(basket.items, itemToAdd, quantity);
    this.setBasket(basket);
  }
  private addOrUpdateItem(items: IBasketItem[], itemToAdd: IBasketItem, quantity: number): IBasketItem[] {
    const index = items.findIndex(i => i.id === itemToAdd.id);
    if(index === -1){
      itemToAdd.quantity = quantity;
      items.push(itemToAdd)
    } else{
      items[index].quantity += quantity;
    }
    return items;
  }

  incrementItemQuantity(item: IBasketItem)
  {
    const basket = this.getCurrentBasketValue();
    const foundItemIndex = basket.items.findIndex(x => x.id === item.id);
    basket.items[foundItemIndex].quantity++;
    this.setBasket(basket);
  }

  decrementItemQuantity(item: IBasketItem)
  {
    const basket = this.getCurrentBasketValue();
    const foundItemIndex = basket.items.findIndex(x => x.id === item.id);
    if(basket.items[foundItemIndex].quantity > 1)
    {
      basket.items[foundItemIndex].quantity--;
      this.setBasket(basket);
    }else{
      this.removeItemFromBasket(item);
    }
  }
  removeItemFromBasket(item: IBasketItem) {
    const basket = this.getCurrentBasketValue();
    if(basket.items.some(x => x.id === item.id))
    {
      basket.items = basket.items.filter(i => i.id !== item.id);
      if(basket.items.length > 0)
      {
        this.setBasket(basket);
      }else{
        this.deleteBasket(basket);
      }
    }
  }
  deleteBasket(basket: IBasket) {
    return this.http.delete(this.baseUrl + 'basket?id=' + basket.id).subscribe(() => {
      this.basketSource.next(new Basket());
      this.basketTotalSource.next({shipping: 0, total: 0, subtotal: 0});
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('basket_id');
      }
    }, error => {
      console.log(error);
    })
  }

  private calculateTotal(){
    const basket = this.getCurrentBasketValue();
    const shipping = this.shipping;
    const subtotal = basket.items.reduce((a,b) => (b.price * b.quantity) + a, 0);
    const total = subtotal + shipping;
    this.basketTotalSource.next({shipping,total,subtotal});
  }

  public createBasket(): IBasket {
    const basket = new Basket();
    console.log('Creating new basket with ID:', basket.id);
    if (isPlatformBrowser(this.platformId)) {
      console.log('Attempting to save basket ID to localStorage:', basket.id);
      localStorage.setItem('basket_id',basket.id);
      console.log('localStorage after setItem:', localStorage.getItem('basket_id'));
    }
    this.setBasket(basket);
    return basket;
  }
  private mapProductItemToBasketItem(item: IProduct, quantity: number): IBasketItem {
    return{
      id: item.id,
      productName: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      quantity,
      band: item.productBand,
      type: item.productType
    }
  }
  deleteLocalBasket() {
    this.basketSource.next(new Basket());
    this.basketTotalSource.next({shipping: 0, total: 0, subtotal: 0});
    localStorage.removeItem('basket_id');
  }
}
