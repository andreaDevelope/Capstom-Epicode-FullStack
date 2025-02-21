import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MentorProfileViewComponent } from './mentor-profile-view.component';

const routes: Routes = [{ path: '', component: MentorProfileViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MentorProfileViewRoutingModule { }
