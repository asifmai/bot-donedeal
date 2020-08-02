const schedule = require('node-schedule');
const getConfig = require('./getconfig');
const bot = require('../bot');

module.exports = async () => new Promise(async (resolve, reject) => {
  try {
    const config = await getConfig.get();
    
    // Setup Cron job at scheduleTime
    const cronSchedule = `*/${config.repeat} * * * *`;
    const job = schedule.scheduleJob(cronSchedule, async (fireDate) => {
      bot.run();
    });
  
    console.log(`Cron job configured at every ${config.repeat} minutes...`);
    resolve(true);
  } catch (error) {
    console.log(`setupCronJob Error: ${error}`);
    reject(error);
  }
})
