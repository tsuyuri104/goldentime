import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { pipe } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RouteName } from 'src/app/classes/route-name';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {


  constructor(private router: Router) {
    this.setSelectedPage(RouteName.REGISTER);
  }

  ngOnInit(): void {
    this.setSelectedPage(RouteName.REGISTER);
  }

  public setSelectedPage(itemName: string): boolean {
    // this.router.events.pipe(filter(value => {
    //   return value instanceof NavigationEnd;
    // })).subscribe(value => {

    // });
    return itemName === RouteName.REGISTER;
  }
}
