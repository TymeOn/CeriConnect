import { Component, OnInit } from '@angular/core';
import {Socket} from "ngx-socket-io";

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserlistComponent implements OnInit {

  constructor(private socket: Socket) { }

  ngOnInit(): void {
  }

  // listens on a websocket for the list of all the connected users
  getConnectedUsers(): any {
    return this.socket.fromEvent('connected-users');
  }

}
