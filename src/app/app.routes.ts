
import { Routes } from '@angular/router';
import { X01Component } from './pages/x01/x01';
import { CheckoutComponent } from './pages/checkout/checkout';

export const routes: Routes = [
  { path: 'x01', component: X01Component },
  { path: 'checkout', component: CheckoutComponent },
  { path: '', redirectTo: '/x01', pathMatch: 'full' }
];
