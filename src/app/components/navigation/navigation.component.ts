import { Component, OnInit } from '@angular/core';
import { UrdayinService } from 'src/app/services/urdayin.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  public userName: string = "";

  constructor(private sUrdayin: UrdayinService) {

  }

  async ngOnInit(): Promise<void> {
    this.userName = await this.sUrdayin.getUserName(this.sUrdayin.getSelectedUser());
  }

}
