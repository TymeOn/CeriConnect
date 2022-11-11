import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {NotifierService} from "angular-notifier";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private notifier: NotifierService, private router: Router) { }

  public login(username: string, password: string) {
    this.http.post('https://localhost:3289/login', {username: username, password: password})
      .subscribe((data) => {
        // getting the last connection data
        const session = this.getSessionData(username);
        this.setLoggedIn(true, username, session);

        this.setSessionData(username, {lastLogin : new Date()});

        this.notifier.notify('success', 'Connexion réussie. Redirection...');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      })
    ;
  }

  public logout() {
    this.setLoggedIn(false);
    this.router.navigate(['/']);
  }

  // check localStorage for the login status
  public getLoggedIn() {
    const sessionStatus = localStorage.getItem('loggedIn');
    return (sessionStatus ? JSON.parse(sessionStatus) : null);
  }

  // set the login status in localStorage
  public setLoggedIn(login: boolean, username = '', session = null) {
    if (login) {
      localStorage.setItem('loggedIn', JSON.stringify({username: username, session: session}));
    } else {
      localStorage.removeItem('loggedIn');
    }
  }

  public getSessionData(username: string) {
    const parsedUsername = username.trim().replace(/ /g,'_').toLocaleUpperCase();
    const sessionData = localStorage.getItem('sessionData_' + parsedUsername);
    return (sessionData ? JSON.parse(sessionData) : null);
  }

  public setSessionData(username: string, session: any) {
    const parsedUsername = username.trim().replace(/ /g,'_').toLocaleUpperCase();
    localStorage.setItem(('sessionData_' + parsedUsername), JSON.stringify(session));
  }

}
