import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArlasAnalyticsComponent } from '@components/arlas-analytics/arlas-analytics.component';
import { ArlasListComponent } from '@components/arlas-list/arlas-list.component';
import { ArlasMapComponent } from '@components/arlas-map/arlas-map.component';
import { ArlasWuiRootComponent } from '@components/arlas-wui-root/arlas-wui-root.component';
import { ForgotComponent, LoginComponent, RegisterComponent, ResetComponent, VerifyComponent } from 'arlas-wui-toolkit';


const routes: Routes = [
  { path: '', component: ArlasWuiRootComponent},
  { path: 'map', component: ArlasMapComponent },
  { path: 'analytics', component: ArlasAnalyticsComponent },
  { path: 'list', component: ArlasListComponent },
  { path: 'callback', redirectTo: '' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify/:id/user/:token', component: VerifyComponent },
  { path: 'password_forgotten', component: ForgotComponent },
  { path: 'reset/:id/user/:token', component: ResetComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
