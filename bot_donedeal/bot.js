require('dotenv').config();
const pupHelper = require('./helpers/puppeteerhelper');
const getConfig = require('./helpers/getconfig');
const nodemailer = require('nodemailer');
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

    // await sendEmail();
    
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
          carsLinks.push({
            timeListed, carLink
          });
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
    console.log(`${carIdx+1}/${carsLinks.length} - Fetching Car ${carsLinks[carIdx].carIdx}`);
    page = await pupHelper.launchPage(browser);
    await page.goto(carsLinks[carIdx].carLink, {timeout: 0, waitUntil: 'networkidle2'});
    
    const specs = await fetchSpecs(page);

    car.title = await pupHelper.getTxt('.cad-header h1', page);
    car.link = carsLinks[carIdx].carLink;
    car.make = await getCellValue('make / model', specs);
    car.model = await getCellValue('model', specs);
    car.year= await getCellValue('year', specs);
    car.mileage = await getCellValue('mileage', specs);
    car.transmission = await getCellValue('transmission', specs);
    car.color = await getCellValue('colour', specs);
    car.doors = await getCellValue('doors', specs);
    car.price = await pupHelper.getTxt('.price-info__left-options span.price', page);
    car.images = await pupHelper.getAttr('.gallery-media-content img', 'src', page);
    car.timeListed = carsLinks[carIdx].timeListed;
    console.log(car);
    results.push(car);

    await page.close();
    resolve(true);
  } catch (error) {
    if (page) await page.close();
    console.log(`fetchCar[${carsLinks[carIdx].carLink}] Error: `, error);
    reject(error);
  }
});

const getCellValue = (label, specs) => new Promise(async (resolve, reject) => {
  try {
    let returnVal = '';

    for (const key in specs) {
      if (key !== '' && key.toLowerCase() == label.toLowerCase()) {
        returnVal = specs[key];
      }
    }

    resolve(returnVal);
  } catch (error) {
    console.log('getCellValue Error: ', error);
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

const sendEmail = () => new Promise(async (resolve, reject) => {
  try {
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        console.log(err);
      } else {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });
        
    
        const mailOptions = {
          from: 'Test2Sure.com <test2sure.com@gmail.com>',
          to: 'test2sure@gmail.com',
          // to: 'asifmai@hotmail.com',
          subject: 'Contact Us',
          html: generateEmailBody(name, email, subject, message),
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Contact Us Email Sent : %s', info.response);
        });
      }
    });
    //  dasfd
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD // naturally, replace both with your real credentials or an application-specific password
      }
    });
    
    const mailOptions = {
      from: 'bot.donedeal@gmail.com',
      to: 'asifmai@hotmail.com',
      subject: 'Done Deal Bot Notifications',
      text: 'Dudes, we really need your money.'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    resolve(true);
  } catch (error) {
    console.log('sendEmail Error: ', error);
    reject(error);
  }
});

this.run();
