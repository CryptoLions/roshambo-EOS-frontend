import { Component, OnInit } from '@angular/core';
import { MainService } from './services/main.service';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

import * as moment from 'moment'

import { forkJoin } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

	constructor(private MainService: MainService, private http: HttpClient){
    this.MainService.setPlayer(environment.botName);
  }
	
	WINDOW:any = window;
	connected = (localStorage.getItem("user") === "connected") ? true : false;
	userName;
	logout = this.MainService.logout;
  eos = this.MainService.returnEosNet();
  gamesPlayed;
  timeUpdate = 60000;
  GAMES_M = [];
  GAMES_C = [];
  moment = moment;
  version = environment.version;

  initScatter(){
   	this.MainService.initScatter((err, account) => {
   			if (err){
   				return console.error(err);
   			}
   			this.userName = account;
   	});
  };

  createGamesTable(){
    this.http.get('/api/v1/games/log')
         .subscribe((res: any) => {
             this.gamesPlayed = res;
         }, (err) => {
           console.error(err);
         });
  }


  createNavDropdowns(){
      this.MainService.getMyGamesCalls((err, calls) => {
          if (err){
            return console.error(err);
          }
          for(let k in calls){
            if (this.GAMES_C.indexOf(calls[k].host) < 0){
              this.GAMES_C.push(calls[k].host);
            }
          }
      });

      this.MainService.getGameChallenges((err, challenges) => {
          if (err){
            return console.error(err);
          }
          if (this.GAMES_M.length < Object.keys(challenges).length){
              document.title = '* ' + document.title;
          }
          for(let k in challenges){
            if (this.GAMES_M.indexOf(challenges[k].challenger) < 0){
              this.GAMES_M.push(challenges[k].challenger);
            }
          }
      });
  }           

	ngOnInit(){
     this.createGamesTable();
     setInterval( () => { this.createNavDropdowns() }, 1000);
	   if (this.connected){
           if (!this.WINDOW.ScatterJS){
                document.addEventListener('scatterLoaded', () => {
                      this.initScatter();
                });
           } else {
             this.initScatter();
           }
      }
	}

}
