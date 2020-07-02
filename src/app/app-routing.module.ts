import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PrintComponent } from './components/print/print.component';


const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'print', component: PrintComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
