import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IOrder } from '../shared/models/order';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  baseUrl= environment.apiUrl;

  constructor(private http: HttpClient){}

  getOrdersForUser(){
    return this.http.get<IOrder[]>(this.baseUrl + 'orders');
  }

  getOrderDetailed(id: number){
    return this.http.get<IOrder>(this.baseUrl + 'orders/' + id);

  }

  async getAllOrderIds(): Promise<number[]> {
    // You may need a dedicated `/orders/ids` endpoint; otherwise:
    const orders = await firstValueFrom(this.http.get<IOrder[]>(`${this.baseUrl}orders`));
    return orders.map((o) => o.id);
  }


}
