import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { Observable } from "rxjs";
import { isPlatformBrowser } from "@angular/common";

@Injectable()
export class JwtInterceptor implements HttpInterceptor{
    constructor(@Inject(PLATFORM_ID) private platformId: Object){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('token');
            if(token) {
                req = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        }
        return next.handle(req);
    }
}