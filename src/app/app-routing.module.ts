import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotComponent, LoginComponent, RegisterComponent, ResetComponent, VerifyComponent } from 'arlas-wui-toolkit';
import { ArlasWuiRootComponent } from './components/arlas-wui-root/arlas-wui-root.component';


const routes: Routes = [
  { path: '', component: ArlasWuiRootComponent},
  { path: 'callback', redirectTo: '' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify/:id/user/:token', component: VerifyComponent },
  { path: 'password_forgot', component: ForgotComponent },
  { path: 'reset/:id/user/:token', component: ResetComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
