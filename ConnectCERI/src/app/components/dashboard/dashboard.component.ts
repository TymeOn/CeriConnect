import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/fr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  postList: any[] = [];
  pageSize = 5;
  page = 1;

  constructor(public auth: AuthService, private http: HttpClient) {
    dayjs.extend(customParseFormat);
    dayjs.extend(relativeTime);
    dayjs.locale('fr');
  }

  ngOnInit(): void {
    if (this.auth.getLoggedIn()) {
      this.http.get(environment.url + 'posts').subscribe((data: any) => {
        this.postList = data;
      });
    }
  }

  getDate(value: string) {
    return dayjs(value, "YYYY-MM-DD HH:mm").format('DD/MM/YYYY HH:mm');
  }

  getDateFromNow(value: string) {
    return dayjs(value, "YYYY-MM-DD HH:mm").fromNow();
  }

  isValidComment(comment: any) {
    return (typeof comment !== 'string')
      && (Object.keys(comment).length > 0)
      && (comment.hasOwnProperty('text'))
      && (comment.hasOwnProperty('commentedBy'))
      && (comment.hasOwnProperty('date'))
      && (comment.hasOwnProperty('hour'))
      && (comment.hasOwnProperty('author'));
  }

  addComment(postId: number, commentInput: HTMLInputElement) {
    this.http.post(environment.url + 'comments', {postId: postId, userId: this.auth.getLoggedIn().userId, text: commentInput.value}).subscribe((data: any) => {
      if (data.acknowledged) {
        this.ngOnInit();

        // commentInput.value = '';
        //
        // this.postList.forEach((post: any, i: number) => {
        //   if (post._id == postId) {
        //     this.postList[i].comments.push(data.comment);
        //   }
        // });
        // this.postList = this.postList.map((p: any) => Object.assign({}, p));
      }
    });
  }

}
