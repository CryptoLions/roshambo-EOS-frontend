import { Component, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private MainService: MainService){}
  WINDOW :any = window;
  connected = (localStorage.getItem("user") === "connected") ? true : false;
  challenger;
  eos = this.MainService.returnEosNet();
  recentPlayers = (localStorage.getItem("players")) ? localStorage.getItem("players").split(",") : [];
  config = environment;
  

  initScatter(){
  	 this.MainService.initScatter((err, account) => {
  	 		if (err){
  	 			return console.error(err);
  	 		}
  	 		location.reload();
  	 });
  };

  createGame(challenger){
      this.MainService.createGame(challenger);
  }


  ngOnInit(){
  }

}
