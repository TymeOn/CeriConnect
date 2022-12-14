import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {NotifierService} from "angular-notifier";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private notifier: NotifierService, private router: Router) { }

  // try to log in a user
  public login(username: string, password: string) {
    this.http.post(environment.url + 'login', {username: username, password: password})
      .subscribe((data: any) => {
        // getting the last connection data
        const session = this.getSessionData(username);
        this.setLoggedIn(true, username, data.id, session);

        this.setSessionData(username, {lastLogin : new Date()});

        this.notifier.notify('success', 'Connexion réussie. Redirection...');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      })
    ;
  }

  // logout the current user
  public logout() {
    this.http.get(environment.url + 'logout/' + this.getLoggedIn().userId).subscribe(() => {
      this.setLoggedIn(false);
      this.router.navigate(['/']).then();
    });
  }

  // check localStorage for the login status
  public getLoggedIn() {
    const sessionStatus = localStorage.getItem('loggedIn');
    return (sessionStatus ? JSON.parse(sessionStatus) : null);
  }

  // set the login status in localStorage
  public setLoggedIn(login: boolean, username = '', userId = 0, session = null) {
    if (login) {
      localStorage.setItem('loggedIn', JSON.stringify({username: username, userId: userId, session: session}));
    } else {
      localStorage.removeItem('loggedIn');
    }
  }

  // get the session data in localStorage
  public getSessionData(username: string) {
    const parsedUsername = username.trim().replace(/ /g,'_').toLocaleUpperCase();
    const sessionData = localStorage.getItem('sessionData_' + parsedUsername);
    return (sessionData ? JSON.parse(sessionData) : null);
  }

  // set the session data in localStorage
  public setSessionData(username: string, session: any) {
    const parsedUsername = username.trim().replace(/ /g,'_').toLocaleUpperCase();
    localStorage.setItem(('sessionData_' + parsedUsername), JSON.stringify(session));
  }

}
