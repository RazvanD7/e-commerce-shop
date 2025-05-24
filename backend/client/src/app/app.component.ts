import { Component, OnInit, Inject } from '@angular/core';
import { BasketService } from './basket/basket.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Shop';

  constructor(private basketService: BasketService, @Inject(PLATFORM_ID) private platformId: Object){}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const basketId = localStorage.getItem('basket_id');
      if(basketId){
        this.basketService.getBasket(basketId).subscribe(() => {
          console.log('initialised basket');
        }, error => {
          console.log(error);
        });
      }
    }
  }
}
