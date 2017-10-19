import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

export const ROUTES: Routes = [
  { path: '', component: AppComponent }
];
export const routing = RouterModule.forRoot(ROUTES);
