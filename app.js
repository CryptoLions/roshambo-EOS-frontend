var scatter;
var scatterInited = false;
var accountName;
var gcontract = "rpstester123";
var gLoaded = false;

var GAME_TYPE = null;
var GLOBAL_GAME_KEY = null;

var player_submited = {};
var GAMES_H = {};
var GAMES_C = {};

var RECENT_PLAYEPS = localStorage.getItem("players") || null;

var chain 		 = chain;
var network 	 = network;
var scatterLogin = localStorage.getItem('user');
eos = eos;

$(document).ready(function() {
	init();
	$("#btn_cancel").click(function(){
		  closeGame(GAMES_H[GLOBAL_GAME_KEY].challenger);
	});

    var hash = window.location.hash.split("?");
    
	if (hash[0] === "#top100"){
		setTimeout(getTableWinners, 800);
	} else if(hash[0] === "#challenge"){
		renderMyGames(hash[1]);
	} else if(hash[0] === "#call"){
		renderGamesCall(hash[1]);
	}

	if (RECENT_PLAYEPS){
		var html = "<small>Recent players: </small>";
		RECENT_PLAYEPS = RECENT_PLAYEPS.split(",");
		RECENT_PLAYEPS.forEach(function(name){
			html += "<div class='uk-label' onClick='setRecentPlayer(\"" + name + "\")'>" + name + "</div>"
		});
		$("#recentPlayers").html(html).css("display", "inline-block");
	}

	if (!PRODUCTION){
		$("body").css("background", "url('./imgs/section-background.svg') 50% 17vh no-repeat,linear-gradient(to left top, #218838bf, #218838) 0 0 no-repeat");
		$(".uk-label").css("background", "#209362");
		$(".uk-button-primary").css("color", "#209362");
		$(".uk-button-primary").hover(function(){
			$(this).css("box-shadow", "0 10px 40px #209362");
		});
		$("#logoText").text("Jungle roshambo");
	}

}); 


function init(){
	document.addEventListener('scatterLoaded', scatterExtension => {
	    scatter = window.scatter;
	    if(scatterLogin === 'connected'){
			return  initScatter();
	    }
	    $(".get-started").fadeIn();
	});
}



function initScatter(){
	return scatter.suggestNetwork(network).then((selectedNetwork) => {
			const requiredFields = { accounts: [{ blockchain: 'eos', chainId: network.chainId }] };
	
			eos = scatter.eos(network, Eos, {chainId:network.chainId}, network.secured ? 'https' : undefined);
			return scatter.getIdentity(requiredFields).then(identity => {

				if (identity.accounts.length === 0) {
					return;
				}
				localStorage.setItem('user', 'connected');
				accountName = identity.accounts[0].name;
				scatterInited = true;

				$(".login-menu").fadeIn();
				$("#userName").text(accountName);

				initGame();
			}).catch(error => showScatterError(error));
		}).catch(error => showScatterError(error));
}

function showScatterError(error){
	if (!error) return;

    $("#gameContainer").hide();
	var msg = error.message;

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

	UIkit.notification({
    	message: msg,
    	status: 'danger',
    	pos: 'top-center',
    	timeout: 3000
	});
}

function logout(){
	localStorage.setItem('user', 'disconnect');
	scatter.forgetIdentity().then(() => {
        window.location.href = "/";
    }).catch(err => {
        console.error(err);
    });
}


//------------- MAIN GAMES CODE

function initGame(){
    $("#gameContainer").fadeIn();
    $(".get-started").fadeOut();

	$("#inputContainer").show();
	$("#game-icons").show();

    getMyGames();
    setInterval(function(){
    	getMyGames();
    	renderGames_H();
    	renderGames_C();

    	if (GAME_TYPE === "CHALLENGE" && GLOBAL_GAME_KEY){
    		renderMyGames(GLOBAL_GAME_KEY);
    	} else if (GAME_TYPE === "CALL" && GLOBAL_GAME_KEY){
    		renderGamesCall(GLOBAL_GAME_KEY);
    	}
    }, 1000);
}

function createGame(){
   var challenger = $('#inp_create_game_challenger').val();

   setCookie("rpschallenger", challenger, 100);
   setPlayer(challenger);

   if (challenger.length !== 12){
			UIkit.notification({
    			message: 'Account name must be 12 characters!',
    			status: 'danger',
    			pos: 'top-center',
    			timeout: 3000
			});
			return;
   }

   eos.contract(gcontract).then((contract) => {
		contract.create(accountName, challenger, { authorization: [accountName]}).then((res) => {
			getMyGamesCalls(function(){
				let gameKey = Object.keys(GAMES_H)[0];
				window.location.href = "/#challenge?" + gameKey;
				renderMyGames(gameKey);
			});
		}).catch(error => {
        	var error_ = JSON.parse(error);
        	console.log(error_.error.details[0].message);
    		UIkit.notification({
    			message: error_.error.details[0].message,
    			status: 'danger',
    			pos: 'top-center',
    			timeout: 3000
			});
		});

	}).catch(error => {
        	console.error(error);
	});
}

/*var icons = [];
icons[1] = '<i class="fas fa-hand-rock game-actions-icons"></i>';
icons[2] = '<i class="fas fa-hand-paper game-actions-icons"></i>';
icons[3] = '<i class="fas fa-hand-scissors game-actions-icons"></i>';
icons[4] = '<i class="fas fa-hand-rock game-actions-icons"></i>';
icons[5] = '<i class="fas fa-hand-paper game-actions-icons"></i>';
icons[6] = '<i class="fas fa-hand-scissors game-actions-icons"></i>';*/

var icons = [];
icons[1] = '<img width="50px" src="imgs/rock_r.png" alt="Rock" title="Rock" />';
icons[2] = '<img width="50px" src="imgs/paper_r.png" alt="Paper" title="Paper" />';
icons[3] = '<img width="50px" src="imgs/scissor_r.png" alt="Scissors" title="Scissors" />';
icons[4] = '<img width="50px" src="imgs/rock_l.png" alt="Rock" title="Rock" />';
icons[5] = '<img width="50px" src="imgs/paper_l.png" alt="Paper" title="Paper" />';
icons[6] = '<img width="50px" src="imgs/scissor_l.png" alt="Scissors" title="Scissors" />';



var GAME_BTNS_STATE = {};
	GAME_BTNS_STATE.create = 0;

var autoMove02 = "";
var gamesHISTORYS = {};


function renderGames_H(){
    var html = "";
    var gamesCounter = 0;

	if (!gLoaded) return;


	if (Object.keys(GAMES_H).length == 0) {
        GAME_BTNS_STATE.cancel = 0;
		if ( !GAME_BTNS_STATE.create) {
			GAME_BTNS_STATE.create = 1;
			$('#btn_cancel').hide();
		}
		$("#gameCallsHZero").show("");
		return;
	}

    if (GAME_BTNS_STATE.create) {
    	GAME_BTNS_STATE.create = 0;
    }
	
	$('#gameCallsH').html("");

	for (var k in GAMES_H){
		gamesCounter += 1;
		$('#gameCallsH').append("<li class='uk-active'><a href='#challenge?" + k + "' onClick='renderMyGames(\"" + k + "\")'>" + GAMES_H[k].challenger + "</a></li>");
	}
	$(".callsCounterAlertH").show();
	$("#callsCounterAlertH").text(gamesCounter);
}

function renderMyGames(k){

	GAME_TYPE = "CHALLENGE";
	GLOBAL_GAME_KEY = k;

    var hash = window.location.hash.split("?");
	if (hash[0] !== "#challenge"){
		return;
	}

	$("#games_container").html("");
	$("#inputContainer").hide();
	$("#game-icons").hide();
	$('#btn_cancel').show();
	$('#globaRank').hide();

	if(!GAMES_H[k]){
		return;
	}

	if (GAMES_H[k].updated === 1 || GAMES_H[k].updated === 2){
				gamesHISTORYS[GAMES_H[k].host] = [];


				var g_status = getGameStatusH(GAMES_H[k]);
				gameTables_create("games_container", GAMES_H[k].host, GAMES_H[k].challenger, g_status.hstatus, g_status.cstatus);

				gamesHISTORYS[GAMES_H[k].host][0] = "<b>[ " + GAMES_H[k].host + " ]</b>" + " started game to " + "<b>[ " + GAMES_H[k].challenger + " ]</b>" + "";
                   addGameHistory(GAMES_H[k].host);

				if (GAMES_H[k].winner == GAMES_H[k].host){
			       	$('#winnerh_' + GAMES_H[k].host).show();
			       	$('#looserc_' + GAMES_H[k].host).show();

					gamesHISTORYS[GAMES_H[k].host][6] = "!! <b>[ " + GAMES_H[k].host + " ]</b> WINNER !!";
                   	addGameHistory(GAMES_H[k].host);

				}
			    if (GAMES_H[k].winner == GAMES_H[k].challenger){
			       	$('#winnerc_' + GAMES_H[k].host).show();
					$('#looserh_' + GAMES_H[k].host).show();
					gamesHISTORYS[GAMES_H[k].host][6] = "!! <b>[ " + GAMES_H[k].challenger + " ]</b> WINNER !!";
                   	addGameHistory(GAMES_H[k].host);

				}
	} else if (GAMES_H[k].updated === -1){
			//$('#gh_' + GAMES_H[k].host).remove();
			//delete GAMES_H[k];
			//$('#btn_cancel').hide();
			window.location.href = "/";
	}
}


function renderGames_C(){
    var html = "";

	if (!gLoaded) return;

	if (Object.keys(GAMES_C).length == 0) {
  		$("#gameCallsZero").show();
		return;
	}

	var gamesCounter = 0;

	$('#gameCalls').html("");

	for (var k in GAMES_C){
		gamesCounter += 1;
		$('#gameCalls').append("<li class='uk-active'><a href='#call?" + k + "' onClick='renderGamesCall(\"" + k + "\")'>" + k + "</a></li>");
	}
	$(".callsCounterAlert").show();
	$("#callsCounterAlert").text(gamesCounter);
}

function renderGamesCall(k){

	  	GAME_TYPE = "CALL";
	  	GLOBAL_GAME_KEY = k;

	  	var hash = window.location.hash.split("?");
		if (hash[0] !== "#call"){
			return;
		}

	  	$("#games_container").html("");
		$("#inputContainer").hide();
	  	$("#game-icons").hide();
	  	$('#btn_cancel').hide();
		$('#globaRank').hide();

		if(!GAMES_C[k]){
			return;
		}

		if (GAMES_C[k].updated === 1 || GAMES_C[k].updated === 2){
				  gamesHISTORYS[GAMES_C[k].host] = [];

				  var g_status = getGameStatusC(GAMES_C[k]);
				  gameTables_create("games_container", GAMES_C[k].host, GAMES_C[k].challenger, g_status.hstatus, g_status.cstatus);

				  gamesHISTORYS[GAMES_C[k].host][0] = "<b>[ " + GAMES_C[k].host + " ]</b>" + " started game to " + "<b>[ " + GAMES_C[k].challenger + " ]</b>" + "";
                  addGameHistory(GAMES_C[k].host);

			      if (GAMES_C[k].winner == GAMES_C[k].host){
			      	$('#winnerh_' + GAMES_C[k].host).show();
			      	$('#looserc_' + GAMES_C[k].host).show();
			      	gamesHISTORYS[GAMES_C[k].host][6] = "!! <b>[ " + GAMES_C[k].host + " ]</b> WINNER !!";
                  	addGameHistory(GAMES_C[k].host);

				  }
			      if (GAMES_C[k].winner == GAMES_C[k].challenger) {
			      	$('#winnerc_' + GAMES_C[k].host).show();
			      	$('#looserh_' + GAMES_C[k].host).show();
			      	gamesHISTORYS[GAMES_C[k].host][6] = "!! <b>[ " + GAMES_C[k].challenger + " ]</b> WINNER !!";
                  	addGameHistory(GAMES_C[k].host);
                  }
        } else if (GAMES_C[k].updated === -1){
					//$('#gh_' + GAMES_C[k].host).remove();
					//delete GAMES_C[k];
					window.location.href = "/";
        }
}


function addGameHistory(host){

	var hist = "";
    for (var k in gamesHISTORYS[host] ){
		hist += gamesHISTORYS[host][k] + "<BR>";
    }

	$('#gh_' + host + '_history').html(hist);

}

function getGameStatusH(game){
    var res = {hstatus: "", cstatus: ""};
	if (!gamesHISTORYS[game.host]) gamesHISTORYS[accountName] = [];

	$('#game-icons').hide();

	if (game.accepted == 0) {
		res.hstatus = "<span class='msg_bgl msg_bgl_y'>Hi, <BR> I am waiting your Join </span>";
		res.cstatus = "<span class='msg_bgr msg_bgr_y'>Looking oportunity to Join</span>";

		return res;
	} else {
        var null_hash = "0000000000000000000000000000000000000000000000000000000000000000";
		var msg  = "";
		gamesHISTORYS[game.host][1] = "<b>[ " + game.challenger + " ]</b>" + " accepted.";

		if (game.ph_move_hash == null_hash){
			var rps_btn   = '<button class="uk-button uk-button-primary marg_btm_5" type="button" id="btn_move1" onclick="move01(1, \''+game.host+'\', \''+game.challenger+'\', 1)" >' + icons[4] + '</button><BR />';
				rps_btn  += '<button class="uk-button uk-button-primary marg_btm_5" type="button" id="btn_move2" onclick="move01(2, \''+game.host+'\', \''+game.challenger+'\', 1)">' + icons[5] + '</button><BR />';
				rps_btn  += '<button class="uk-button uk-button-primary marg_btm_5" type="button" id="btn_move3" onclick="move01(3, \''+game.host+'\', \''+game.challenger+'\', 1)">' + icons[6] + '</button></br>';
            res.hstatus = rps_btn;
		} else {
			res.hstatus = "<span class='msg_bgl  msg_bgl_y'>waiting on oponent move to confirm own move...</span>";
 			gamesHISTORYS[game.host][2] = "<b>[ " + game.host + " ]</b> " + "sent move hash: <span class='hash-container' onClick='copyToClipboard(\"" + game.ph_move_hash + "\")'>" + game.ph_move_hash + "</span>";
		}

		if (game.pc_move_hash == null_hash){
			res.cstatus = "<span class='msg_bgr msg_bgr_y'>waiting for oponent move...</span>";
		} else {
        	res.cstatus = "<span class='msg_bgr msg_bgr_y'>I am waiting your turn to confirm my move...</span>";
 			gamesHISTORYS[game.host][3] = "<b>[ " + game.challenger + "] </b> " + "sent move hash: <span class='hash-container' onClick='copyToClipboard(\"" + game.pc_move_hash + "\")'>" + game.pc_move_hash + "</span>";
		}

        if (game.ph_move_hash != null_hash && game.pc_move_hash != null_hash) {

			if (game.ph_move == 0) {
				res.hstatus = "<span class='msg_bgl msg_bgl_y'>Please <a href='#' class='move-two' onclick='move02(\"" + game.host + "\", \"" + game.challenger + "\", 1);'>confirm</a> your move...</span>";
			} else {
				var msg_col = "msg_bgl_y";
				if (game.host == game.winner) msg_col = "msg_bgl_g";
				if (game.challenger == game.winner) msg_col = "msg_bgl_r";

				res.hstatus = "<div class='msg_bgl " + msg_col + "'>Move confirmed: " + icons[game.ph_move+3] + "</div>";
	 			gamesHISTORYS[game.host][4] = "<b>[ " + game.host + " ]</b> " + "Confirmed Move: " + icons[game.ph_move+3] + "<BR/ > [move: "+game.ph_move+", nonce: " + game.ph_move_nonce + " = " + game.ph_move + "" + game.ph_move_nonce + " <a href='https://md5calc.com/hash/sha256/" + game.ph_move + "" + game.ph_move_nonce + "' target='_blank'>check</a>" + "]";
			}

			if (game.pc_move == 0) {
				res.cstatus = "<span class='msg_bgr msg_bgr_y'>I'll confirm my move asap...</span>";
			} else {
				var msg_col = "msg_bgr_y";
				if (game.challenger == game.winner) msg_col = "msg_bgr_g";
				if (game.host == game.winner) msg_col = "msg_bgr_r";

				res.cstatus = "<span class='msg_bgr " + msg_col + "'>Move confirmed: " + icons[game.pc_move] + "</span>";
	 			gamesHISTORYS[game.host][5] = "<b>[ " + game.challenger + " ]</b> " + "Confirmed Move: " + icons[game.pc_move] + "<BR/ > [move: "+game.pc_move+", nonce: " + game.pc_move_nonce + " = " + game.pc_move + "" + game.pc_move_nonce + " <a href='https://md5calc.com/hash/sha256/" + game.pc_move + "" + game.pc_move_nonce + "' target='_blank'>check</a>" +"]";
			}


			if (autoMove02 != game.ph_move_hash && game.ph_move == 0) {
				autoMove02 = game.ph_move_hash;
				move02(game.host, game.challenger, 1);

			}
        }
        addGameHistory(game.host);
        return res;
	}
}


function getGameStatusC(game){
    var res = {hstatus: "", cstatus: ""};
	if (!gamesHISTORYS[game.host]) gamesHISTORYS[accountName] = [];

	if (game.accepted == 0) {
		res.hstatus = "<span class='msg_bgl msg_bgl_y'>ready to play, wait your acceptaion</span>";
		res.cstatus = '<button class="uk-button uk-button-primary" type="button" id="btn_move2" onclick="joing(\''+game.host+'\')">Join</button> ';;

		return res;
	} else {
        var null_hash = "0000000000000000000000000000000000000000000000000000000000000000";
		var msg  = "";
		gamesHISTORYS[game.host][1] = "<b>[ " + game.challenger + " ] </b>" + " accepted.";

		if (game.pc_move_hash == null_hash){
			var rps_btn   = '<button class="uk-button uk-button-primary marg_btm_5" type="button" id="btn_move1" onclick="move01(1, \''+game.host+'\', \''+game.challenger+'\', 2)" >' + icons[1] + '</button><BR />';
				rps_btn  += '<button class="uk-button uk-button-primary marg_btm_5" type="button" id="btn_move2" onclick="move01(2, \''+game.host+'\', \''+game.challenger+'\', 2)">' + icons[2] + '</button><BR />';
				rps_btn  += '<button class="uk-button uk-button-primary marg_btm_5" type="button" id="btn_move3" onclick="move01(3, \''+game.host+'\', \''+game.challenger+'\', 2)">' + icons[3] + '</button></br>';
            res.cstatus = rps_btn;
		} else {
			res.cstatus = "<span class='msg_bgr msg_bgr_y'>waiting on oponent move hash, ready to confirm...</span>";
 			gamesHISTORYS[game.host][2] = "<b>[ " + game.challenger + " ]</b> " + "sent move hash: <span class='hash-container' onClick='copyToClipboard(\"" + game.ph_move_hash + "\")'>" + game.ph_move_hash + "</span>";
		}

		if (game.ph_move_hash == null_hash){
			res.hstatus = "<span class='msg_bgl msg_bgl_y'>I'll move now..</span>";
		} else {
        	res.hstatus = "<span class='msg_bgl msg_bgl_y'>oponents wait your turn to confirm move...</span>";
 			gamesHISTORYS[game.host][3] = "<b>[ " + game.host + " ]</b> " + "sent move hash: <span class='hash-container' onClick='copyToClipboard(\"" + game.pc_move_hash + "\")'>" + game.pc_move_hash + "</span>";
		}

        if (game.ph_move_hash != null_hash && game.pc_move_hash != null_hash) {

			if (game.ph_move == 0) {
				res.hstatus = "<span class='msg_bgl msg_bgl_y'>waiting oponent move confirmation...</span>";
			} else {
				var msg_col = "msg_bgl_y";
				if (game.host == game.winner) msg_col = "msg_bgl_g";
				if (game.challenger == game.winner) msg_col = "msg_bgl_r";

				res.hstatus = "<span class='msg_bgl " + msg_col + "'>Move confirmed: " + icons[game.ph_move+3] + "</span>";
	 			gamesHISTORYS[game.host][4] = "<b>[ " + game.host + " ]</b> " + "Confirmed Move: " + icons[game.ph_move+3] + "<BR /> [move: "+game.ph_move+", nonce: " + game.ph_move_nonce + " = " + game.ph_move + "" + game.ph_move_nonce + " <a href='https://md5calc.com/hash/sha256/" + game.ph_move + "" + game.ph_move_nonce + "' target='_blank'>check</a>" + "]";
			}

			if (game.pc_move == 0) {
				res.cstatus = "<span class='msg_bgr  msg_bgr_y'>Please <a href='#' class='move-two' onclick='move02(\"" + game.host + "\", \"" + game.challenger + "\", 2);'>confirm</a> your move...</span>";
			} else {
				var msg_col = "msg_bgr_y";
				if (game.challenger == game.winner) msg_col = "msg_bgr_g";
                if (game.host == game.winner) msg_col = "msg_bgr_r";

				res.cstatus = "<span class='msg_bgr " + msg_col + "'>Move confirmed: " + icons[game.pc_move] + "</span>";
	 			gamesHISTORYS[game.host][5] = "<b>[ " + game.challenger + " ]</b> " + "Confirmed Move: " + icons[game.pc_move] + "<BR /> [move: "+game.pc_move+", nonce: " + game.pc_move_nonce + " = " + game.ph_move + "" + game.ph_move_nonce + " <a href='https://md5calc.com/hash/sha256/" + game.pc_move + "" + game.pc_move_nonce + "' target='_blank'>check</a>" +"]";
			}


			if (autoMove02 != game.ph_move_hash && game.ph_move == 0) {
				autoMove02 = game.ph_move_hash;
				move02(game.host, game.challenger, 2);

			}
        }
        addGameHistory(game.host);
        return res;
	}
}

function checkUpdateGames(GAMES_, G){
	if (Object.keys(GAMES_).length  == 0 && Object.keys(G).length == 0){
		return;
	}

	for (var k in GAMES_){
		var gh = GAMES_[k];
		if (!G[k]) {
			GAMES_[k].updated = 1;
			G[k] = GAMES_[k];
		} else {
			for (var kk in gh){

				if (gh[kk] != G[k][kk] && kk != "updated"){
					G[k] = gh;
					G[k].updated = 2;
					break;
				}
			}
		}
	}

	for (var k in G){
		if (!GAMES_[k]){
			G[k].updated = -1;
		}
	}

	gLoaded = 1;
}


function getMyGames(){
	eos.getTableRows({json:true, scope: gcontract, code: gcontract, table: 'games', limit:100, table_key: "host", lower_bound: accountName, upper_bound: accountName+"a", index_position: 1 }).then(res => {
   		let rows = res.rows;
		var GAMES_H_ = {};
   		for (var j = 0; j < rows.length; j++) {
			GAMES_H_[rows[j].host] = {host: rows[j].host, challenger: rows[j].challenger, accepted: rows[j].accepted, ph_move_hash: rows[j].ph_move_hash, pc_move_hash: rows[j].pc_move_hash, ph_move: rows[j].ph_move, ph_move_nonce: rows[j].ph_move_nonce, pc_move: rows[j].pc_move, pc_move_nonce: rows[j].pc_move_nonce, winner: rows[j].winner}

		}
        checkUpdateGames(GAMES_H_, GAMES_H);
        gLoaded = 1;
   	});

	eos.getTableRows({json:true, scope: gcontract, code: gcontract, table: 'games', limit:100, table_key: "challenger", lower_bound: accountName, upper_bound: accountName+"a", "key_type": "i64", index_position: 2 }).then(res => {
   		let rows2 = res.rows;
		var GAMES_C_ = {};
   		for (var j = 0; j < rows2.length; j++) {
        	GAMES_C_[rows2[j].host] = {host: rows2[j].host, challenger: rows2[j].challenger, accepted: rows2[j].accepted, ph_move_hash: rows2[j].ph_move_hash, pc_move_hash: rows2[j].pc_move_hash, ph_move: rows2[j].ph_move, ph_move_nonce: rows2[j].ph_move_nonce, pc_move: rows2[j].pc_move, pc_move_nonce: rows2[j].pc_move_nonce, winner: rows2[j].winner};
		}
		checkUpdateGames(GAMES_C_, GAMES_C);
   	});
}

function getMyGamesCalls(callback){
	eos.getTableRows({json:true, scope: gcontract, code: gcontract, table: 'games', limit:100, table_key: "host", lower_bound: accountName, upper_bound: accountName+"a", index_position: 1 }).then(res => {
   		let rows = res.rows;
		var GAMES_H_ = {};
   		for (var j = 0; j < rows.length; j++) {
			GAMES_H_[rows[j].host] = {host: rows[j].host, challenger: rows[j].challenger, accepted: rows[j].accepted, ph_move_hash: rows[j].ph_move_hash, pc_move_hash: rows[j].pc_move_hash, ph_move: rows[j].ph_move, ph_move_nonce: rows[j].ph_move_nonce, pc_move: rows[j].pc_move, pc_move_nonce: rows[j].pc_move_nonce, winner: rows[j].winner}

		}
        checkUpdateGames(GAMES_H_, GAMES_H);
        gLoaded = 1;
        callback();
   	});
}

function getGameChallenges(callback){
	eos.getTableRows({json:true, scope: gcontract, code: gcontract, table: 'games', limit:100, table_key: "challenger", lower_bound: accountName, upper_bound: accountName+"a", "key_type": "i64", index_position: 2 }).then(res => {
   		let rows2 = res.rows;
		var GAMES_C_ = {};
   		for (var j = 0; j < rows2.length; j++) {
        	GAMES_C_[rows2[j].host] = {host: rows2[j].host, challenger: rows2[j].challenger, accepted: rows2[j].accepted, ph_move_hash: rows2[j].ph_move_hash, pc_move_hash: rows2[j].pc_move_hash, ph_move: rows2[j].ph_move, ph_move_nonce: rows2[j].ph_move_nonce, pc_move: rows2[j].pc_move, pc_move_nonce: rows2[j].pc_move_nonce, winner: rows2[j].winner};
		}
		checkUpdateGames(GAMES_C_, GAMES_C);
		callback();
   	});
}

function updateGameView(){
	console.log(GAME_TYPE);
	if (GAME_TYPE === "CHALLENGE"){
		getMyGamesCalls(function(){
			//renderMyGames(GLOBAL_GAME_KEY);
			window.location.href = "/#challenge?" + GLOBAL_GAME_KEY;
		});
	} else if (GAME_TYPE === "CALL"){
		getGameChallenges(function(){
			//renderGamesCall(GLOBAL_GAME_KEY);
			window.location.href = "/#call?" + GLOBAL_GAME_KEY;
		});
	}
}

function joing(host){
	eos.contract(gcontract).then((contract) => {
		contract.join(host, accountName, { authorization: [accountName]}).then((res) => {
			//getMyGames();
			updateGameView();
		}).catch(error => {
			console.error(error);
		});
	}).catch(error => {
		console.error(error)
	});
}


var move = {};
var nonce = {};


function move01(move_, host, challenger, by){
	//move = 3;
	move[host] = move_;
	nonce[host] = Math.floor((Math.random() * 100000000) + 1);

	setCookie("rps_" + host + by + "_move", move[host], 10);
	setCookie("rps_" + host + by + "_nonce", nonce[host], 10);

	var my_move = move[host] + "" + nonce[host];
	var move_hash = eosjs_ecc.sha256(my_move);

	console.log(move[host]+":"+nonce[host]+":"+move_hash);

	var by_name = challenger;
	if (by == 1){
		by_name = host;
	}
	eos.contract(gcontract).then((contract) => {
		contract.move1(host, challenger, by_name, move_hash, { authorization: [accountName]}).then((res) => {
			console.log(res)
			//getMyGames();
			updateGameView();
		}).catch(error => {
        	console.error(error);
		});
	}).catch(error => {
        	console.error(error);
	});

}

function move02(host, challenger, by){
	var by_name = challenger;
	if (by == 1){
		by_name = host;
	}
	if (! nonce[host]) {
		nonce[host] = getCookie("rps_" + host + by + "_nonce")*1;
	}
	if (! move[host]) {
		move[host] = getCookie("rps_" + host + by + "_move")*1;
	}


	console.log("move02: "+move[host]+" : "+nonce[host]+" | host: "+ host + " | ch: "+ challenger+ " | by: "+ by_name);


	eos.contract(gcontract).then((contract) => {
		contract.move2(host, challenger, by_name, move[host], nonce[host], { authorization: [accountName]}).then((res) => {
			console.log(res)
			//getMyGames();
			updateGameView();
		}).catch(error => {
        	console.error(error);
		});
	}).catch(error => {
        	console.error(error);
	});

}

function closeGame(challenger){
	console.log(challenger);
	eos.contract(gcontract).then((contract) => {
		contract.close(accountName, challenger, { authorization: [accountName]}).then((res) => {
			console.log(res);
			//getMyGames();
			window.location.href = "/";
		}).catch(error => {
        	console.error(error);
		});
	}).catch(error => {
        	console.error(error);
	});
}

function gameTables_create(obj, host, chanllenger, hstatus, cstatus){
	var html = '<div class="row" id="gh_'+host+'" id="main-container-game-start"> \
					<div class="col-sm-3" > \
						<span class="user-game-name" id="gh_' + host + '_hname"><b> ' + host + '</b></span> <BR/>\
						<div id="pl_status"> \
							<span id="gh_' + host + '_hstatus" class="text-center">' + hstatus + '</span> \
						</div> \
						<!--<img width="80%" src="imgs/player_l.png" />--> \
						<i class="fas fa-user-ninja user-circle-icon"></i> \
						<h1 class="winner" id="winnerh_'+host+'">WINNER</h1> \
						<h1 class="looser" id="looserh_'+host+'">LOSE</h1> \
					</div> \
					<div class="col-sm-5 main-game-container"> \
						<BR /> \
                        \
			        	<h3 class="header-history">History</h3> \
			        	<div id="gh_'+host+'_history" class="game-history" > \
		            	</div> \
					</div> \
	            	<div class="col-sm-3"> \
						<span class="user-game-name" id="gh_' + host + '_cname"><b> ' + chanllenger + '</b></span> <BR/>\
						<div id="pr_status"> \
							<span id="gh_' + host + '_cstatus" class="text-center">' + cstatus + '</span> \
						</div> \
						<!--<img width="80%" src="imgs/player_r.png" />--> \
						<i class="fas fa-user-astronaut user-circle-icon"></i>\
						<h1 class="winner" id="winnerc_'+host+'">WINNER</h1> \
						<h1 class="looser" id="looserc_'+host+'">LOSE</h1> \
					</div> \
				</div>';

     //return html;
     $('#'+obj).html( $('#'+obj).html() + html);
}

function copyToClipboard(text){
	navigator.clipboard.writeText(text).then(function() {
	  	UIkit.notification({
    		message: 'Copying to clipboard was successful!',
    		status: 'success',
    		pos: 'top-center',
    		timeout: 3000
		});
	}, function(err) {
	   	UIkit.notification({
    		message: 'Could not copy text',
    		status: 'danger',
    		pos: 'top-center',
    		timeout: 3000
		});
	});
}

function getTableWinners(){
	$("#games_container").html("");
	$("#inputContainer").hide();
	$("#game-icons").hide();
	$('#btn_cancel').hide();
	$(".get-started").hide();
	$("#tableLoader").fadeIn();

	eos.getActions({ account_name: gcontract,
	   	 		  	 pos: -1,
	   	 		  	 offset: -1000
				}).then(res => {
   					let sortedRank = sortArrayWinners(res);
   					renderGlobalTableRank(sortedRank);
   				}).catch(error => {
   					console.error(error);
   				});
}

function sortArrayWinners(data){
	if (!data || !data.actions){
		return;
	}
	var result = [];
	var elemsObj = {};
	data.actions.forEach(function(elem, index){
		if (elem.action_trace.act.name === "winns"){
			if (!elemsObj[elem.action_trace.act.data.winner]){
				elemsObj[elem.action_trace.act.data.winner] = 1;
			}
			elemsObj[elem.action_trace.act.data.winner] += 1;
		}
	});
	Object.keys(elemsObj).forEach(function(key){
		result.push({ player: key, games_win: elemsObj[key] });
	})
	result.sort(function(a, b){
			if (a.games_win > b.games_win) return -1;
			if (a.games_win < b.games_win) return 1;
			return 0;
	});
	return result;
}

function renderGlobalTableRank(data){
	let html = "";
	data.forEach(function(elem, index){
		var position = index + 1;
		html += "<tr>\
					<td>" + position + "</td>\
					<td>" + elem.player + "</td>\
					<td>" + elem.games_win + "</td>\
				</tr>";
	});	
	$("#tableLoader").hide();
	$("#globaRank tbody").html(html);
	$("#globaRank").fadeIn();
}

function setRecentPlayer(name){
	$("#inp_create_game_challenger").val(name);
}














