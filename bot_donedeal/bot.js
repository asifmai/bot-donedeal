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
    const carNodes = await page.$$('.card-collection-container > ul.card-collection > li.card-item');

    for (let i = 0; i < carNodes.length; i++) {
      let timeListed = await pupHelper.getTxt('ul.card__body-keyinfo > li:nth-child(4)', carNodes[i]);
      if (timeListed.includes('min') || timeListed.includes('mins')) {
        timeListed = Number(timeListed.replace(/mins/gi, '').trim().replace(/min/gi, '').trim());
        if (timeListed <= Number(config.repeat)) {
          const carLink = await pupHelper.getAttr('a', 'href', carNodes[i]);
          // console.log(`Time Listed: ${timeListed} - Car can be scraped... ${carLink}`);
          carsLinks.push(carLink);
        }
      }
    }

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
    
    const specs = await fetchSpecs(page);
    console.log(specs);

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

const fetchSpecs = (page) => new Promise(async (resolve, reject) => {
  try {
    const specs = {};
    await page.waitForSelector('.cad-content > ul.meta-info > li.meta-info__item');
    const props = await page.$$('.cad-content > ul.meta-info > li.meta-info__item');
    for (let i = 0; i < props.length; i++) {
      const label = await pupHelper.getTxt('.meta-info__key', props[i]);
      const value = await pupHelper.getTxt('.meta-info__value', props[i]);
      specs[label] = value;
    }

    resolve(specs);
  } catch (error) {
    console.log('fetchSpecs Error: ', error);
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
