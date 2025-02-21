import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MentorHomeComponent } from './mentor-home.component';

const routes: Routes = [{ path: '', component: MentorHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MentorHomeRoutingModule { }
