import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';

  constructor(private http: HttpClient, private notifier: NotifierService) { }

  ngOnInit(): void {
  }

  login() {
    this.http.post('https://localhost:3289/login', {username: this.username, password: this.password})
      .subscribe((data) => {
        this.notifier.notify('success', 'Connexion réussie. Redirection...')
      })
    ;
  }

}
