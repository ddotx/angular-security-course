
import {filter, shareReplay, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, BehaviorSubject} from "rxjs";
import {User} from "../model/user";
import * as auth0 from 'auth0-js';
import {Router} from "@angular/router";
import moment = require('moment');

export const ANONYMOUS_USER: User = {
    id: undefined,
    email: ''
};

const AUTH_CONFIG = {
    clientID: '7gOz2r3c6J5iU0IT9GFqcTNpUjIamIoS',
    domain: "dev-f75pnvq5.us.auth0.com"
};


@Injectable()
export class AuthService {

    auth0 = new auth0.WebAuth({
        clientID: AUTH_CONFIG.clientID,
        domain: AUTH_CONFIG.domain,
        responseType: 'token id_token',
        redirectUri: 'https://localhost:4200/lessons',
        scope: 'openid email'
    });

    private userSubject = new BehaviorSubject<User>(undefined);

    user$: Observable<User> = this.userSubject.asObservable().pipe(filter(user => !!user));

    constructor(private http: HttpClient, private router: Router) {
      if(this.isLoggedIn) {
        this.userInfo()
      }
    }

    login() {
      this.auth0.authorize({
        mode: 'login'
      })
    }

    signUp() {
      this.auth0.authorize({
        mode: 'signUp'
      })
    }

    retrieveAuthInfoFromUrl() {
      this.auth0.parseHash((err, authResult) => {
        if(err) {
          console.error(err)
        } else if(authResult && authResult.idToken) {
          // clear url
          window.location.hash = ''
          console.log(authResult)
          // get user data
          this.auth0.client.userInfo(authResult.accessToken, (err, userProfile) => {
          })

          // keep token in localStorage
          this.setSession(authResult)

          // TODO: POST TO DB
          this.userInfo()
        }

      })
    }

    userInfo() { // & get User Preferences
      this.http.put<User>('/api/userInfo', null).pipe(
        shareReplay(),
        tap(user => this.userSubject.next(user))
        ).subscribe()
    }

    logout() {
      localStorage.removeItem('id_token')
      localStorage.removeItem('expires_at')
      this.router.navigate(['/lessons'])
    }

    public isLoggedIn() {
      // check token expired?
      return moment().isBefore(this.getExpiration())
    }

    isLoggedOut() {
        return !this.isLoggedIn();
    }

    getExpiration() {
      const expiration = localStorage.getItem('expires_at')
      const expiresAt = JSON.parse(expiration)
      return moment(expiresAt)
    }

    private setSession(authResult) {

      const expiresAt = moment().add(authResult.expiresIn, 'second')
      localStorage.setItem('id_token', authResult.idToken)
      localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()))
    }

}







