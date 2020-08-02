const pupHelper = require('./helpers/puppeteerhelper');
const getConfig = require('./helpers/getconfig');
let config;
let browser;
const results = [];
let carsLinks = [];

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
    const link = createSiteLink();
    console.log('Site Link: ', link);
    await page.goto(link, {timeout: 0, waitUntil: 'networkidle2'});
    await page.screenshot({path: 'screenshot.png'});

    await page.waitForSelector('.card-collection-container > ul.card-collection > li.card-item');
    carsLinks = await pupHelper.getAttrMultiple('.card-collection-container > ul.card-collection > li.card-item > a', 'href', page);

    for (let carNumber = 0; carNumber < carsLinks.length; carNumber++) {
      await fetchCar(carNumber);
    }

    await page.close();
    resolve(true);
  } catch (error) {
    if (page) await page.close();
    console.log('fetchData Error: ', error);
    reject(error);
  }
});

const fetchCar = (carIdx) => new Promise(async (resolve, reject) => {
  let page;
  try {
    const car = {};
    console.log(`${carIdx+1}/${carsLinks.length} - Fetching Car ${carsLinks[carIdx]}`);
    page = await pupHelper.launchPage(browser);
    await page.goto(carsLinks[carIdx], {timeout: 0, waitUntil: 'networkidle2'});

    car.timeListed = await pupHelper.getTxt('span.time-listed', page);
    // result.make
    // result.model
    // result.year
    // result.mileage
    // result.price
    // result.description
    // result.images
    console.log(car);

    await page.close();
    resolve(true);
  } catch (error) {
    if (page) await page.close();
    console.log(`fetchCar[${carsLinks[carIdx]}] Error: `, error);
    reject(error);
  }
});

const createSiteLink = () => {
  let link = config.siteLink;
  link += `&bodyType=${config.bodyType}`;
  link += `&car-finance=${config['car-finance']}`;
  link += `&numDoors=${config.numDoors}`;
  link += `&fuelType=${config.fuelType}`;
  link += `&source=${config.source}`;
  link += `&adType=${config.adType}`;
  link += `&country=${config.country}`;

  return link;
}

this.run();
