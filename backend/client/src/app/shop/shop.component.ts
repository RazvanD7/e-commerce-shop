import { Component, OnInit } from '@angular/core';
import { IProduct } from '../shared/models/product';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-shop',
  standalone: false,
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  products: IProduct[];

  constructor(private shopService: ShopService){}
  ngOnInit(){
    this.shopService.getProducts().subscribe(response => {
      this.products = response.data;
    }, error => {
      console.log(error);
    })
  }
}
