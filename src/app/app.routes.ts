
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { X01Component } from './pages/x01/x01';
import { CheckoutComponent } from './pages/checkout/checkout';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'x01', component: X01Component },
  { path: 'checkout', component: CheckoutComponent }
];
