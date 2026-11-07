import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor() {}
  title = 'nats-ui';
  items: MenuItem[] = [];
  ngOnInit(): void {

    let itemData = [
      {
        label: 'Overview',
        icon: 'pi pi-server',
        routerLink: '/overview'
      },
      {
        label: 'Streams',
        icon: 'pi pi-database',
        routerLink: '/streams'
      },
      {
        label: 'Consumers',
        icon: 'pi pi-users',
        routerLink: '/consumers'
      },
      {
        label: 'Connections',
        icon: 'pi pi-link',
        routerLink: '/connections'
      }
    ]
    this.items=itemData;
  }
}
