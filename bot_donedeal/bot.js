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
    await page.evaluate(() => {
      document.querySelector('ul.refine-filter-list > li.refine-filter-attribute:nth-child(9)').scrollIntoView();
    });

    await page.screenshot({path: 'screenshot.png'});


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

    await fillFilter('body type', config.bodyType, page);
    await fillFilter('Price / Per Month', config.price, page);
    await fillFilter('doors', config.doors, page);
    await fillFilter('Fuel Type', config.fuelType, page);
    await fillFilter('Seller Type', config.sellerType, page);
    await fillFilter('For Sale / Wanted', config.forSale, page);
    await fillFilter('Country of Registration', config.countryOfRegistration, page);

    resolve(true);
  } catch (error) {
    console.log('fillFilters Error: ', error);
    reject(error);
  }
});

const fillFilter = (name, value, page) => new Promise(async (resolve, reject) => {
  try {
    const attributesCards = await page.$$('ul.refine-filter-list > li.refine-filter-attribute');
    for (let i = 0; i < attributesCards.length; i++) {
      const attributeTitle = await pupHelper.getTxt('h6', attributesCards[i]);
      if(attributeTitle.toLowerCase() == name.toLowerCase()) {
        const options = await attributesCards[i].$$('ng-switch > .ng-scope > .dd-btn');
        for (let j = 0; j < options.length; j++) {
          const optVal = await pupHelper.getTxt('span', options[j]);
          if(optVal.toLowerCase() == value.toLowerCase()) {
            await options[j].click();
            break;
          }
        }
        break;
      }
    }

    await page.waitFor(1000);
    resolve(true);
  } catch (error) {
    console.log('fillFilter Error: ', error);
    reject(error);
  }
});

this.run();
