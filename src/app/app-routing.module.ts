import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { StreamsComponent } from './streams/streams.component';
import { ConsumersComponent } from './consumers/consumers.component';
import { ConnectionsComponent } from './connections/connections.component';

const routes: Routes = [
  {path:'overview',component:OverviewComponent},
  {path:'',pathMatch:'full',redirectTo:'overview'},
  {path:'streams',component:StreamsComponent},
  {path:'consumers',component:ConsumersComponent},
  {path:'connections',component:ConnectionsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
