import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { BasketService } from '../../basket/basket.service';
import { Basket, IBasket } from '../../shared/models/basket';
import { IOrder, IOrderToCreate } from '../../shared/models/order';
import { Address } from '../../shared/models/user';
import { CheckoutService } from '../checkout.service';
import { isPlatformBrowser } from '@angular/common';


declare var Stripe: any;

@Component({
  selector: 'app-checkout-payment',
  standalone: false,
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements AfterViewInit, OnDestroy {
  @Input() checkoutForm?: FormGroup;
  @ViewChild('cardNumber', {static: true}) cardNumberElement: ElementRef;
  @ViewChild('cardExpiry', {static: true}) cardExpiryElement: ElementRef;
  @ViewChild('cardCvc', {static: true}) cardCvcElement: ElementRef;
  stripe: any;
  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;
  cardErrors: any;
  cardHandler = this.onChange.bind(this);
  loading = false;
  cardNumberValid = false;
  cardExpiryValid = false;
  cardCvcValid = false;

  constructor(private basketService: BasketService, private checkoutService: CheckoutService,
      private toastr: ToastrService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
       this.stripe = Stripe('pk_test_51RTM2dQcjXsF1HJgNsRPyCHpgUzbmKsgEsaWeZ5UVMoJts1eaC0FETFajScIkxIeR6nXGYQEEmruer8miVRZi3VT00qYoj3w11');
       const elements = this.stripe.elements();

       this.cardNumber = elements.create('cardNumber');
       this.cardNumber.mount(this.cardNumberElement.nativeElement);
       this.cardNumber.addEventListener('change', this.cardHandler);

       this.cardExpiry = elements.create('cardExpiry');
       this.cardExpiry.mount(this.cardExpiryElement.nativeElement);
       this.cardExpiry.addEventListener('change', this.cardHandler);

       this.cardCvc = elements.create('cardCvc');
       this.cardCvc.mount(this.cardCvcElement.nativeElement);
       this.cardCvc.addEventListener('change', this.cardHandler);
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cardNumber.destroy();
      this.cardExpiry.destroy();
      this.cardCvc.destroy();
    }
  }

  onChange(event) {
    if(event.error){
      this.cardErrors = event.error.message;
    }else {
      this.cardErrors = null;
    }
    switch(event.elementType){
      case 'cardNumber':
        this.cardNumberValid = event.complete;
        break;
        case 'cardExpiry':
        this.cardExpiryValid = event.complete;
        break;
        case 'cardCvc':
        this.cardCvcValid = event.complete;
        break;
    }
  }

  async submitOrder() {
    this.loading = true;
    const basket = this.basketService.getCurrentBasketValue();
    try{
      const createdOrder = await this.createOrder(basket);
      const paymentResult = await this.confirmPaymentWithStripe(basket);

      if(paymentResult.paymentIntent)
        {
          this.basketService.deleteBasket(basket);
      const navigationExtras: NavigationExtras = {state: createdOrder};
      this.router.navigate(['checkout/success'], navigationExtras)
        }
        else{
          this.toastr.error(paymentResult.error.message);
        }
        this.loading = false;
    }catch(error)
    {
      console.log(error);
      this.loading = false;
    }

    
  }


  private async confirmPaymentWithStripe(basket) {
    return this.stripe.confirmCardPayment(basket.clientSecret,{
        payment_method:{
          card: this.cardNumber,
          billing_details:{
            name: this.checkoutForm?.get('paymentForm')?.get('nameOnCard')?.value
          }
        }
      });
  }

  private async createOrder(basket: IBasket) {
    const orderToCreate = this.getOrderToCreate(basket);
    return this.checkoutService.createOrder(orderToCreate).toPromise();
  }

  private getOrderToCreate(basket: IBasket){
    return{
      basketId: basket.id,
      deliveryMethodId: + this.checkoutForm?.get('deliveryForm')?.get('deliveryMethod')?.value,
      shipToAddress: this.checkoutForm?.get('addressForm')?.value
    }
   
  }
}
