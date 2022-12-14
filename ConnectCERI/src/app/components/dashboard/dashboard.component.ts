import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/fr';
import {Socket} from "ngx-socket-io";

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

  constructor(public auth: AuthService, private http: HttpClient, private socket: Socket) {
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

  // gets all the posts from the db
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

  // gets all the users from the db
  getUsers() {
    this.http.get(environment.url + 'users').subscribe((data: any) => {
      this.userList = data;
    });
  }

  // gets a date in a correct format
  getDate(value: string) {
    return dayjs(value, "YYYY-MM-DD HH:mm").format('DD/MM/YYYY HH:mm');
  }

  // gets a date in a "from now on" format
  getDateFromNow(value: string) {
    return dayjs(value, "YYYY-MM-DD HH:mm").fromNow();
  }

  // check the validity of a post
  isValidPost(post: any) {
    return (Object.keys(post).length > 0)
      && (post.hasOwnProperty('date') && dayjs(post.date, 'YYYY-MM-DD', true).isValid())
      && (post.hasOwnProperty('hour') && dayjs(post.hour, 'HH:mm', true).isValid())
      && (post.hasOwnProperty('body'))
      && (post.hasOwnProperty('createdBy'))
      && (post.hasOwnProperty('likes'));
  }

  // check the validity of a comment
  isValidComment(comment: any) {
    return (typeof comment !== 'string')
      && (Object.keys(comment).length > 0)
      && (comment.hasOwnProperty('text'))
      && (comment.hasOwnProperty('commentedBy'))
      && (comment.hasOwnProperty('date'))
      && (comment.hasOwnProperty('hour'))
      && (comment.hasOwnProperty('author'));
  }

  // adds a nex comment to a post
  addComment(postId: number, commentInput: HTMLInputElement) {
    this.http.post(environment.url + 'comments', {postId: postId, userId: this.auth.getLoggedIn().userId, text: commentInput.value}).subscribe((data: any) => {
      if (data.acknowledged) {
        this.getPosts();
      }
    });
  }

  // like (or un-like) a post
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

  // get the status of the like button (if liked or not)
  getLikeButtonClass(postId: number) {
    let buttonClass = 'btn-outline-danger';
    if (this.likedPosts.includes(postId)) {
      buttonClass = 'btn-danger';
    }
    return buttonClass;
  }

  // resets the page and re-gets all the posts after filter or search
  onSortOrFilterChanged() {
    this.page = 1;
    this.getPosts();
  }

  // create a post share
  sharePost(postId: number, shareBody: string, shareUrl: string, shareTitle: string, shareTags: string) {
    let tags = shareTags.split(" ").filter(t => t.charAt(0) === '#');

    this.http.post(environment.url + 'post-share', {
      postId: postId,
      userId: this.auth.getLoggedIn().userId,
      body: shareBody,
      url: shareUrl,
      title: shareTitle,
      tags: tags
    }).subscribe(() => {
      this.page = 1;
      this.getPosts();
    });
  }

  // listens on a websocket for the list of all the connected users
  getConnectedUsers(): any {
    return this.socket.fromEvent('connected-users');
  }

}
