const path = require('path');
const fs = require('fs');

module.exports.get = () => new Promise(async (resolve, reject) => {
  try {  
    const configPath = path.resolve(__dirname, '../../config.json');
    const configs = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
    resolve(configs);
  } catch (error) {
    console.log(`getConfig Error: ${error}`);
    reject(error);
  }
  
})

module.exports.set = (config) => new Promise(async (resolve, reject) => {
  try {
    const configPath = path.resolve(__dirname, '../../config.json');
    fs.writeFileSync(configPath, JSON.stringify(config));
    
    resolve(true);
  } catch (error) {
    console.log(`setConfig Error: ${error}`);
    reject(error);
  }
})

