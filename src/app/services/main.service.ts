import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  
  WINDOW: any = window;
  eos = this.WINDOW.Eos(environment.Eos);
  accountName: any = '';
  GAMES_C = [];
  GAMES_M = [];
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

  initScatter(callback){
    this.WINDOW.ScatterJS.scatter.connect('roshambo').then(connected => {
      if(!connected) {
          return this.showScatterError('Can\'t connect to Scatter', callback);
      } 
      this.ScatterJS       = this.WINDOW.ScatterJS.scatter;
      this.WINDOW.scatter  = null;
		  this.eos             = this.ScatterJS.eos(environment.network, this.WINDOW.Eos, { chainId: environment.network.chainId }, environment.network.protocol);
      
		  this.ScatterJS.getIdentity({ accounts: [environment.network] }).then(identity => {
		  	if (identity.accounts.length === 0) {
		  		return;
		  	}
		  	let objectIdentity;
        if (this.ScatterJS.identity && this.ScatterJS.identity.accounts){
               objectIdentity = this.ScatterJS.identity.accounts.find(x => x.blockchain === 'eos');
        }
        objectIdentity   = { name: identity.accounts[0].name };
        this.accountName = objectIdentity.name;
        localStorage.setItem('user', 'connected');
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
  	} else if (error.type == "identity_rejected" && error.code == 402 ){
  		msg = "Please accept Identity request";
  	} else if (error.type == "locked" && error.code == 423 ){
  		msg = "Your Scatter wallet is locked";
  	} else if (error.type == "signature_rejected" && error.code == 402 ){
  		msg = "Voting Transaction canceled (you rejected signature request)";
  	} else if (error.code == 500){
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
      let error_;
      try {
         error_ = JSON.parse(error);
      } catch(e){
         return console.error(error_);
      }
      this.WINDOW.UIkit.notification({
        message: error_.error.details[0].message,
        status: 'danger',
        pos: 'top-center',
        timeout: 3000
       });
  }


  logout(){
	  localStorage.setItem('user', 'disconnect');
    console.log(this.ScatterJS);
	  this.WINDOW.ScatterJS.scatter.forgetIdentity().then(() => {
          location.href = "/";
    }).catch(err => {
          console.error(err);
    });
  }

  createGame(challenger){
  	console.log(challenger);
    
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
    contract.create(this.accountName, challenger, { authorization: [this.accountName] }).then((res) => {
         console.log(res);
         //location.href = "/mygame/" + this.accountName;
         this.findGame(challenger);
    }).catch(error => {
          this.showErr(error);
      });
    }).catch(error => {
          this.showErr(error);
    });
  }

  findGame(challenger){
      let found = false;
      this.GAMES_M.forEach(elem => {
          if (elem.challenger === challenger){
              location.href = `/mygame/${challenger}/${elem.id}`;
              found = true;
          }
      });
      if (!found){
          setTimeout(() => { this.findGame(challenger) }, 200);
      }
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
                             key_type: "i64", 
                             index_position: 2 })
       .then( (res: any) => {
         this.GAMES_M = res.rows;
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
                             index_position: 3 })
        .then( (res: any) => {
         this.GAMES_C = res.rows;
         callback(null, this.GAMES_C);
       }).catch(err=> {
         callback(err);
       });
  }

  closeGame(id){
    this.eos.contract(environment.gcontract).then(contract => {
             contract.close(this.accountName, id, { authorization: [this.accountName] }).then(res => {
               location.href = "/";
             }).catch((error: any) => {
                   this.showErr(error);
             });
    }).catch(error => {
            this.showErr(error);
    });
  }
  restart(id, challenger){
    this.eos.contract(environment.gcontract).then(contract => {
              contract.restart(this.accountName, id, { authorization: [this.accountName] }).then((res) => {
                    //location.reload();
                    this.GAMES_M = [];
                    this.findGame(challenger);
              }).catch(error => {
                    this.showErr(error);
              });
    }).catch(error => {
            this.showErr(error);
    });
  }

  move01(id, move_, challenger, by){
    
    let host = this.accountName;
    this.move[host] = move_;
    this.nonce[host] = Math.floor((Math.random() * 100000000) + 1);

    this.setGame(`rps_${id}_move`, this.move[host]);
    this.setGame(`rps_${id}_nonce`, this.nonce[host]);
  
    let my_move   = this.move[host] + "" + this.nonce[host];
    let move_hash = this.WINDOW.eosjs_ecc.sha256(my_move);
    let by_name   = (by === 1) ? host : challenger;

    this.eos.contract(environment.gcontract).then((contract) => {
      contract.move1(id, by_name, move_hash, { authorization: [this.accountName] }).then((res) => {
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

  move02(id, challenger, by){
    let host    = this.accountName;
    let by_name = (by === 1) ? host : challenger;

    if (! this.nonce[host]) {
       this.nonce[host] = Number(this.getGame(`rps_${id}_nonce`));
    }
    if (! this.move[host]) {
       this.move[host] = Number(this.getGame(`rps_${id}_move`));
    }

    console.log(this.nonce, this.move);
  
    this.eos.contract(environment.gcontract).then((contract) => {
      contract.move2(id, by_name, this.move[host], this.nonce[host], { authorization: [this.accountName] }).then((res) => {
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





