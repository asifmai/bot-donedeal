const pupHelper = require('./helpers/puppeteerhelper');
const getConfig = require('./helpers/getconfig');
let config;
let browser;

module.exports.run = () => new Promise(async (resolve, reject) => {
  try {
    console.log('Started Scraping...');
    config = await getConfig.get();
    browser = await pupHelper.launchBrowser();

    await fetchData();
    
    console.log('Finished Scraping...');
    await browser.close();
    resolve(true);
  } catch (error) {
    if (browser) await browser.close();
    console.log(`Bot Run Error: ${error}`);
    reject(error);
  }
})

const fetchData = () => new Promise(async (resolve, reject) => {
  let page;
  try {
    page = await pupHelper.launchPage(browser);
    await page.goto(config.siteLink, {timeout: 0, waitUntil: 'networkidle2'});
    await fillFilters(page);


    await page.close();
    resolve(true);
  } catch (error) {
    if (page) await page.close();
    console.log('fetchData Error: ', error);
    reject(error);
  }
});

const fillFilters = (page) => new Promise(async (resolve, reject) => {
  try {
    await page.waitForSelector('ul.refine-filter-list');

    resolve(true);
  } catch (error) {
    console.log('fillFilters Error: ', error);
    reject(error);
  }
});

this.run();
