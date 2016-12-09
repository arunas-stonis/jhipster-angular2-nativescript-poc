import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';

import { StateService } from 'ui-router-ng2';

import { User } from './user.model';
import { UserService } from './user.service';
import { AlertService, ITEMS_PER_PAGE, ParseLinks, Principal } from '../../shared';
import { EventManager } from '../../shared/service/event-manager.service';

@Component({
    selector: 'user-mgmt',
    templateUrl: './user-management.component.html'
})
export class UserMgmtComponent implements OnInit {

    currentAccount: any;
    users: User[];
    error: any;
    success: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    reverse: any;

    constructor(
        private userService: UserService,
        private parseLinks: ParseLinks,
        private alertService: AlertService,
        private principal: Principal,
        private $state: StateService,
        private eventManager: EventManager
    ) {
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.page = 1;
        this.reverse = false;
        this.predicate = 'id';
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInUsers();
    }

    registerChangeInUsers() {
        this.eventManager.subscribe('userListModification', (response) => this.loadAll());
    }
    setActive (user, isActivated) {
        user.activated = isActivated;

        this.userService.update(user).subscribe(
            response => {
                if (response.status === 200) {
                    this.error = null;
                    this.success = 'OK';
                    this.loadAll();
                } else {
                    this.success = null;
                    this.error = 'ERROR';
                }
            });
    }
    loadAll () {
        this.userService.query({
            page: this.page -1,
            size: this.itemsPerPage,
            sort: this.sort()
        }).subscribe(
            (res: Response) => this.onSuccess(res.json(), res.headers),
            (res: Response) => this.onError(res.json())
        );
    }
    private onSuccess (data, headers) {
        //hide anonymous user from user management: it's a required user for Spring Security
        for (let i in data) {
            if (data[i]['login'] === 'anonymoususer') {
                data.splice(i, 1);
            }
        }
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.queryCount = this.totalItems;
        // this.page = pagingParams.page;
        this.users = data;
    }
    private onError (error) {
        this.alertService.error(error.error, error.message, null);
    }
    sort () {
        let result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }
    loadPage (page) {
        this.page = page;
        this.transition();
    }
    transition () {
        this.$state.transitionTo(this.$state.$current, {
            page: this.page,
            sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
        });
    }
}
