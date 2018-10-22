/* Cron tasks for daemons , crate by orange1337 */

const cron        = require('node-cron');
const fork        = require('child_process').fork;
const path        = require('path');

let HISTORY_ACTIONS = 0;
let TOP_100 = 0;

module.exports = (config, logSlack) => {
        
        cron.schedule(`*/${config.updateHistoryTime} * * * * *`, () => {
            if (HISTORY_ACTIONS === 0){
                console.log('====== start history daemon');
                startHistoryDaemon();
            }
        });

        cron.schedule(`*/${config.updateHistoryTime} * * * * *`, () => {
            if (TOP_100 === 0){
                console.log('====== start top 100 daemon');
                startTopDaemon();
            }
        });

        startHistoryDaemon();
        startTopDaemon();
}

function startHistoryDaemon(){
        HISTORY_ACTIONS += 1;
        let forkProcess = fork(path.join(__dirname, './history.daemon.js'));
        forkProcess.on('close', res => {
              console.log('\x1b[36m%s\x1b[0m', '====== history daemon END =====');
              HISTORY_ACTIONS = 0;
        });
}
function startTopDaemon(){
        TOP_100 += 1;
        let forkProcess = fork(path.join(__dirname, './top100.daemon.js'));
        forkProcess.on('close', res => {
              console.log('\x1b[36m%s\x1b[0m', '====== top 100 daemon END =====');
              TOP_100 = 0;
        });
}