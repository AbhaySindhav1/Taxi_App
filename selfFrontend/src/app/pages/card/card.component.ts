import {
  AfterContentInit,
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { Form } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';

interface Card {
  imageUrl: string;
  cardNumber: string;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  // selectedCard: Card | any;
  // form: Form | any;
  // stripe: any;
  
  // options: any = {
  //   mode: 'setup',
  //   currency: 'usd',
  //   // Fully customizable with appearance API.
  //   appearance: {
  //     /*...*/
  //   },
  // };


  // async loadStripe() {
  //   this.stripe = await loadStripe(
  //     'pk_test_51N93JqGPole4IExIKCJEeJeBeKyHTnvzng0TyDxVkWRypNfpHBpHOKVTmLJ2c7uRvdnRVTGvlbh2LsD95VEGWTdT00iQYhTiR0'
  //   );

  //   const elements = this.stripe.elements(this.options);

  //   const paymentElement = elements.create('payment');
  //   paymentElement.mount('#payment-element');
  // }
  // ngOnInit(): void {
  //   this.loadStripe();
  // }

  // cards: Card[] = [
  //   {
  //     imageUrl:
  //       'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg',
  //     cardNumber: 'XXXX XXXX XXXX 7878',
  //   },
  //   {
  //     imageUrl:
  //       'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg',
  //     cardNumber: 'XXXX XXXX XXXX 7978',
  //   },
  //   {
  //     imageUrl:
  //       'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg',
  //     cardNumber: 'XXXX XXXX XXXX 8078',
  //   },
  // ];

  // handleCardSelection(card: Card) {
  //   this.selectedCard = card;
  //   console.log('Selected Card Number:', card.cardNumber);
  // }

  // handleError = (error: any) => {};
}
