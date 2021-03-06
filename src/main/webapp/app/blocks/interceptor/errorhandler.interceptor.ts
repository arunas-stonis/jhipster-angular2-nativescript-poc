import { HttpInterceptable } from './http.interceptable';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { EventManager } from '../../shared/service/event-manager.service';

export class ErrorHandlerInterceptor extends HttpInterceptable {

    constructor(private eventManager: EventManager) {
        super();
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return <Observable<Response>> observable.catch(error => {
            if (!(error.status === 401 && (error.text() === '' || (error.json().path && error.json().path.indexOf('/api/account') === 0 )))) {
                this.eventManager.broadcast( {name: 'jhipsterApp.httpError', content: error});
            }
            return Observable.throw(error);
        });
    }
}
