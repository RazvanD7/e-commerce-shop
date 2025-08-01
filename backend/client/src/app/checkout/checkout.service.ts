import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import{IDeliveryMethod} from '../shared/models/deliveryMethod';
import { IOrder, IOrderToCreate } from '../shared/models/order';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
baseUrl= environment.apiUrl;
  constructor(private http: HttpClient) { }

  getDeliveryMethods(){
    return this.http.get<IDeliveryMethod[]>(this.baseUrl + 'orders/deliveryMethods').pipe(
      map((dm: IDeliveryMethod[]) => {
        return dm.sort((a,b) => b.price - a.price);
      })
    );
  }
  createOrder(order: IOrderToCreate) {
    return this.http.post<IOrder>(this.baseUrl + 'orders', order);
  }
}
