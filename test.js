const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { default: axios } = require('axios');
puppeteer.use(StealthPlugin())


const url = `https://nhentai.net/api/gallery/`
async function data(){
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.58')
  await page.goto('https://nhentai.net/');
  await page.waitForTimeout(5000)

  const pagedata = await page.evaluate(() => {
    return {
        html: document.documentElement.innerHTML,
        width: document.documentElement.clientWidth,
        heigh: document.documentElement.clientHeight,
    }
  })


  return pagedata
}


