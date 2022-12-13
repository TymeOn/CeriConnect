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
  userList: any[] = [];
  likedPosts: number[] = [];

  // pagination parameters
  pageSize = 5;
  page = 1;

  // sort parameters
  sortOptions = [
    {id: 0, name: 'Date (+ Récent)'},
    {id: 1, name: 'Date (+ Ancien)'},
    {id: 2, name: 'Likes (+)'},
    {id: 3, name: 'Likes (-)'}
  ];
  selectedSort = this.sortOptions[0].id;

  // filter parameters
  selectedUser = 0;

  constructor(public auth: AuthService, private http: HttpClient) {
    dayjs.extend(customParseFormat);
    dayjs.extend(relativeTime);
    dayjs.locale('fr');
  }

  ngOnInit(): void {
    if (this.auth.getLoggedIn()) {
      this.getPosts();
      this.getUsers();
    }
  }

  getPosts() {
    this.http.get(environment.url + 'posts/' + this.selectedSort + '/' + this.selectedUser).subscribe((data: any) => {
      const tempPosts: any[] = [];
      data.forEach((datum: any) => {
        if (this.isValidPost(datum)) {
          tempPosts.push(datum);
        }
      })
      this.postList = tempPosts;
    });
  }

  getUsers() {
    this.http.get(environment.url + 'users').subscribe((data: any) => {
      this.userList = data;
    });
  }

  getDate(value: string) {
    return dayjs(value, "YYYY-MM-DD HH:mm").format('DD/MM/YYYY HH:mm');
  }

  getDateFromNow(value: string) {
    return dayjs(value, "YYYY-MM-DD HH:mm").fromNow();
  }

  isValidPost(post: any) {
    console.log(post);
    return (Object.keys(post).length > 0)
      && (post.hasOwnProperty('date') && dayjs(post.date, 'YYYY-MM-DD', true).isValid())
      && (post.hasOwnProperty('hour') && dayjs(post.hour, 'HH:mm', true).isValid())
      && (post.hasOwnProperty('body'))
      && (post.hasOwnProperty('createdBy'))
      && (post.hasOwnProperty('likes'));
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
        this.getPosts();
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

  like(postId: number) {
    if (this.likedPosts.includes(postId)) {
      // if the post was already liked
      this.likedPosts.splice(this.likedPosts.indexOf(postId), 1);
      this.http.get(environment.url + 'post-unlike/' + postId).subscribe(() => {
        this.getPosts();
      });
    } else {
      // if the post was not yet liked
      this.likedPosts.push(postId);
      this.http.get(environment.url + 'post-like/' + postId).subscribe(() => {
        this.getPosts();
      });
    }

  }

  getLikeButtonClass(postId: number) {
    let buttonClass = 'btn-outline-danger';
    if (this.likedPosts.includes(postId)) {
      buttonClass = 'btn-danger';
    }
    return buttonClass;
  }

  onSortOrFilterChanged() {
    this.page = 1;
    this.getPosts();
  }

}
