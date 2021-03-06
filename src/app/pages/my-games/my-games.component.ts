import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainService } from '../../services/main.service';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../../environments/environment';
 
@Component({
  selector: 'app-my-games',
  templateUrl: './my-games.component.html',
  styleUrls: ['./my-games.component.css']
})
export class MyGamesComponent implements OnInit, OnDestroy {

  constructor(private MainService: MainService, private route: ActivatedRoute) {
	  this.icons[1] = '<img width="50px" src="assets/images/rock_l.png" alt="Rock" title="Rock" />';
	  this.icons[2] = '<img width="50px" src="assets/images/paper_l.png" alt="Paper" title="Paper" />';
	  this.icons[3] = '<img width="50px" src="assets/images/scissor_l.png" alt="Scissors" title="Scissors" />';
  }
  
  user;
  challenger;
  host;
  game;
  timer;
  nullHash = "0000000000000000000000000000000000000000000000000000000000000000";
  tableLoader = false;
  icons = [];
  confirm = false;
  config = environment;
  id;


  moveFirst(id, game, challenger, num){
  	this.MainService.move01(id, game, challenger, num);
  }
  
  moveSecond(id, challenger, num){
  	this.MainService.move02(id, challenger, num);
  }

  copyHash(hash){
  	this.MainService.copyToClipboard(hash);
  }

  closeGame(){
  		this.MainService.closeGame(this.id);
  }

  restart(){
      this.MainService.restart(this.id, this.challenger);
  }

  renderGame(){
       this.tableLoader = true;
  	   this.game = this.findById();
  	   this.host = this.MainService.accountName;

       if (this.game && this.game.ph_move_hash !== this.nullHash && 
           this.game.pc_move_hash !== this.nullHash && 
           !this.confirm && this.game.winner === 'none' && !this.game.ph_move)
       {
           this.moveSecond(this.game.id, this.game.challenger, 1);
           this.confirm = true;
           console.log('Move confirmed !!!');
       }
  	   this.timer = setTimeout( () => { this.renderGame() }, 1000);
  }

  findById(){
      let result;
      this.MainService.GAMES_M.forEach(elem => {
            if (elem.id === this.id){
                result = elem;
                this.tableLoader = false;
            }
      });
      return result;
  }

  ngOnInit() {
  	this.user = this.route.params.subscribe(params => {
       this.challenger = params['challenger'];
       this.id = Number(params['id']);
       this.renderGame();
    });
  }

  ngOnDestroy() {
    this.user.unsubscribe(); 
    clearTimeout(this.timer);
  }
}
