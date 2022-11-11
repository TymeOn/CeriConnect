import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { NotifierService } from 'angular-notifier';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private notifier: NotifierService) {}

  // in case of an error in any http request, display the error
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof ErrorEvent) {
          this.notifier.notify('error', 'Une erreur est survenue. Veuillez réessayer ultérieurement.');
        } else {
          this.notifier.notify('error', err.error.message);
        }
        return throwError(err);
      }),
    );
  }

}
