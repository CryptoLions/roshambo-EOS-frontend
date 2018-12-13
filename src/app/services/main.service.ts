import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
//import {ScatterJS} from 'scatterjs-core';
//import {ScatterEOS} from 'scatterjs-plugin-eosjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  
  WINDOW: any = window;
  eos = this.WINDOW.Eos(environment.Eos);
  accountName = '';
  GAMES_C = {};
  GAMES_M = {};
  move = {};
  nonce = {};
  navigator: any = navigator;
  ScatterJS;

  constructor(){
     this.WINDOW.ScatterJS.plugins(new this.WINDOW.ScatterEOS());
  }

  returnEosNet(){
  	 return this.eos;
  }

  getAccountName(){
      return this.accountName;
  }

  initScatter(callback){
    this.WINDOW.ScatterJS.scatter.connect('roshambo').then(connected => {
      if(!connected) {
          return this.showScatterError('Can\'t connect to Scatter', callback);
      } 
      
      this.ScatterJS = this.WINDOW.ScatterJS.scatter;
      this.WINDOW.scatter = null;
      
      //console.log("this.ScatterJS", this.ScatterJS);

		  const requiredFields = { accounts: [environment.network] };

		  this.eos = this.ScatterJS.eos(environment.network, this.WINDOW.Eos, { chainId: environment.network.chainId }, environment.network.protocol);
      
		  this.ScatterJS.getIdentity(requiredFields).then(identity => {
		  	if (identity.accounts.length === 0) {
		  		return;
		  	}
		  	localStorage.setItem('user', 'connected');
		  	
         let objectIdentity = this.WINDOW.ScatterJS.scatter.identity.accounts.find(x => x.blockchain === 'eos'); //identity.accounts[0].name;
         this.accountName = (objectIdentity && objectIdentity.name) ? objectIdentity.name : null;
         console.log("this.accountName", this.accountName);
		  	 callback(null, this.accountName);
		  }).catch(error => this.showScatterError(error, callback));
    }).catch(error => {
        this.showScatterError(error, callback);
    });
  }

  showScatterError(error, callback){
	if (!error) return;

	let msg = error.message;

	if (error.type == "account_missing" && error.code == 402 ){
		msg = "Missing required accounts, repull the identity. Choose account the same as added in Scatter.";
	}

	if (error.type == "identity_rejected" && error.code == 402 ){
		msg = "Please accept Identity request";
	}

	if (error.type == "locked" && error.code == 423 ){
		msg = "Your Scatter wallet is locked";
	}

	if (error.type == "signature_rejected" && error.code == 402 ){
		msg = "Voting Transaction canceled (you rejected signature request)";
	}

  if (error.code == 500){
    msg = "You can't close game in the middle";
  }

	this.WINDOW.UIkit.notification({
    	message: msg,
    	status: 'danger',
    	pos: 'top-center',
    	timeout: 3000
	});

	callback(error);
  }


  showErr(error){
      let error_ = JSON.parse(error);
      this.WINDOW.UIkit.notification({
        message: error_.error.details[0].message,
        status: 'danger',
        pos: 'top-center',
        timeout: 3000
       });
  }


  logout(){
	  localStorage.setItem('user', 'disconnect');
    //console.log(this.ScatterJS);
	  this.WINDOW.ScatterJS.scatter.forgetIdentity().then(() => {
          window.location.href = "/";
      }).catch(err => {
          console.error(err);
      });
  }

  createGame(challenger){
    
    if (challenger === this.accountName){
      this.WINDOW.UIkit.notification({
          message: 'Account can\'t be the same',
          status: 'danger',
          pos: 'top-center',
          timeout: 3000
      });
      return;
   }

   if (challenger.length !== 12){
      this.WINDOW.UIkit.notification({
          message: 'Account name must be 12 characters!',
          status: 'danger',
          pos: 'top-center',
          timeout: 3000
      });
      return;
   }

   this.setPlayer(challenger);

   this.eos.contract(environment.gcontract).then((contract) => {
    contract.create(this.accountName, challenger, { authorization: [this.accountName]}).then((res) => {
         window.location.href = "/mygame/" + this.accountName;
    }).catch(error => {
          this.showErr(error);
      });
    }).catch(error => {
          this.showErr(error);
    });
  }

  restart(){
     this.eos.contract(environment.gcontract).then((contract) => {
      contract.restart(this.accountName, { authorization: [this.accountName]}).then((res) => {
            location.reload();
      }).catch(error => {
            this.showErr(error);
      });
    }).catch(error => {
            this.showErr(error);
    });
  }


  getGameChallenges(callback){
    if (!this.accountName){
        return;
    }
    this.eos.getTableRows({  json: true, 
                             scope: environment.gcontract,
                             code: environment.gcontract, 
                             table: 'games', 
                             limit: 100, 
                             table_key: "host", 
                             lower_bound: this.accountName, 
                             upper_bound: this.accountName + "a", 
                             index_position: 1 })
       .then( (res: any) => {
         let rows = res.rows;
         let GAMES_M_ = {};
         for (let j = 0; j < rows.length; j++) {
            GAMES_M_[rows[j].host] = { host: rows[j].host, 
                                       challenger: rows[j].challenger, 
                                       accepted: rows[j].accepted, 
                                       ph_move_hash: rows[j].ph_move_hash, 
                                       pc_move_hash: rows[j].pc_move_hash, 
                                       ph_move: rows[j].ph_move, 
                                       ph_move_nonce: rows[j].ph_move_nonce, 
                                       pc_move: rows[j].pc_move, 
                                       pc_move_nonce: rows[j].pc_move_nonce, 
                                       winner: rows[j].winner 
                                     };
         }
         this.checkUpdateGames(GAMES_M_, this.GAMES_M);
         callback(null, this.GAMES_M);
       }).catch(err => {
          callback(err);
       });
  }

  getMyGamesCalls(callback){
    if (!this.accountName){
        return;
    }
    this.eos.getTableRows({  json: true, 
                             scope: environment.gcontract, 
                             code: environment.gcontract, 
                             table: 'games', 
                             limit: 100, 
                             table_key: "challenger", 
                             lower_bound: this.accountName, 
                             upper_bound: this.accountName + "a", 
                             key_type: "i64", 
                             index_position: 2 })
        .then( (res: any) => {
         let rows2 = res.rows;
         let GAMES_C_ = {};
         for (let j = 0; j < rows2.length; j++) {
            GAMES_C_[rows2[j].host] = { host: rows2[j].host, 
                                        challenger: rows2[j].challenger, 
                                        accepted: rows2[j].accepted, 
                                        ph_move_hash: rows2[j].ph_move_hash, 
                                        pc_move_hash: rows2[j].pc_move_hash, 
                                        ph_move: rows2[j].ph_move, 
                                        ph_move_nonce: rows2[j].ph_move_nonce, 
                                        pc_move: rows2[j].pc_move, 
                                        pc_move_nonce: rows2[j].pc_move_nonce, 
                                        winner: rows2[j].winner
                                      };
         }
         this.checkUpdateGames(GAMES_C_, this.GAMES_C);
         callback(null, this.GAMES_C);
       }).catch(err=> {
         callback(err);
       });
  }

  checkUpdateGames(GAMES_, G){
    if (Object.keys(GAMES_).length  == 0 && Object.keys(G).length == 0){
      return;
    }
  
    for (let k in GAMES_){
      let gh = GAMES_[k];
      if (!G[k]) {
        GAMES_[k].updated = 1;
        G[k] = GAMES_[k];
      } else {
        for (let kk in gh){
  
          if (gh[kk] != G[k][kk] && kk != "updated"){
            G[k] = gh;
            G[k].updated = 2;
            break;
          }
        }
      }
    }
  
    for (let k in G){
      if (!GAMES_[k]){
        G[k].updated = -1;
      }
    }
    return G;
  }


  closeGame(challenger){
    this.eos.contract(environment.gcontract).then((contract) => {
      contract.close(this.accountName, challenger, { authorization: [this.accountName]}).then((res) => {
        //window.location.href = "/";
        this.logout();
      }).catch((error: any) => {
            this.showErr(error);
      });
    }).catch(error => {
            this.showErr(error);
    });
  }

  move01(move_, host, challenger, by){
    
    this.move[host] = move_;
    this.nonce[host] = Math.floor((Math.random() * 100000000) + 1);

    this.setGame("rps_" + host + by + "_move", this.move[host]);
    this.setGame("rps_" + host + by + "_nonce", this.nonce[host]);
  
    let my_move = this.move[host] + "" + this.nonce[host];
    let move_hash = this.WINDOW.eosjs_ecc.sha256(my_move);
  
    let by_name = challenger;
    if (by == 1){
      by_name = host;
    }
    this.eos.contract(environment.gcontract).then((contract) => {
      contract.move1(host, challenger, by_name, move_hash, { authorization: [this.accountName]}).then((res) => {
        console.log(res)
        //getMyGames();
        //updateGameView();
      }).catch(error => {
           this.showErr(error);
      });
    }).catch(error => {
           this.showErr(error);
    });
  }

  move02(host, challenger, by){
    let by_name = challenger;
    if (by == 1){
      by_name = host;
    }

    if (! this.nonce[host]) {
       this.nonce[host] = Number(this.getGame("rps_" + host + by + "_nonce"));
    }
    if (! this.move[host]) {
       this.move[host] = Number(this.getGame("rps_" + host + by + "_move"));
    }

    console.log(this.nonce, this.move);
  
    this.eos.contract(environment.gcontract).then((contract) => {
      contract.move2(host, challenger, by_name, this.move[host], this.nonce[host], { authorization: [this.accountName]}).then((res) => {
        console.log(res)
        //getMyGames();
        //updateGameView();
      }).catch(error => {
            this.showErr(error);
      });
    }).catch(error => {
            this.showErr(error);
    });
  }

  setGame(cname, cvalue) {
    localStorage.setItem(cname, cvalue);
  }

  getGame(cname) {
     return localStorage.getItem(cname);
  }

  setPlayer(name){
    let namesArr = localStorage.getItem("players");
    if (!namesArr){
      localStorage.setItem("players", name);
      return;
    } else if (namesArr.indexOf(name) >= 0){
      return;
    }
    namesArr = namesArr + "," + name;
    localStorage.setItem("players", namesArr);
  }

  copyToClipboard(text){
    this.navigator.clipboard.writeText(text).then(() => {
        this.WINDOW.UIkit.notification({
          message: 'Copying to clipboard was successful!',
          status: 'success',
          pos: 'top-center',
          timeout: 3000
      });
    }, err => {
         this.WINDOW.UIkit.notification({
          message: 'Could not copy text',
          status: 'danger',
          pos: 'top-center',
          timeout: 3000
      });
    });
  }

// ==== service end
}





