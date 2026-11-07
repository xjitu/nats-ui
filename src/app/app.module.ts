import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverviewComponent } from './overview/overview.component';
import { StreamsComponent } from './streams/streams.component';
import { ConsumersComponent } from './consumers/consumers.component';
import { ConnectionsComponent } from './connections/connections.component';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    StreamsComponent,
    ConsumersComponent,
    ConnectionsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ButtonModule,
    CardModule,
    MenubarModule,
    MessageModule,
    TableModule,
    TagModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
