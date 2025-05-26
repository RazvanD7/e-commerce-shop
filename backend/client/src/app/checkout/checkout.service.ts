import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import{IDeliveryMethod} from '../shared/models/deliveryMethod';
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
baseUrl= 'https://localhost:5202/api/';
  constructor(private http: HttpClient) { }

  getDeliveryMethods(){
    return this.http.get<IDeliveryMethod[]>(this.baseUrl + 'orders/deliveryMethods').pipe(
      map((dm: IDeliveryMethod[]) => {
        return dm.sort((a,b) => b.price - a.price);
      })
    );
  }
}
