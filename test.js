const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Qs = require("qs");
const axios = require('axios')
puppeteer.use(StealthPlugin())


const baseUrl = "https://nhentai.net";

random().then(console.log)

// sometimes econreset but works
async function scrape(baseUrl){
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.58')
  await page.goto(baseUrl, {waitUntil: "networkidle2"});
  await page.waitForTimeout(5000)
  const data = await page.evaluate(() => document.querySelector('*').outerHTML);
  await browser.close();
  return data
}

// sometimes econreset but works
async function getBook(bookID){
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.58')
  await page.goto(`${baseUrl}/api/gallery/${bookID}`, {waitUntil: "networkidle2"})
  await page.waitForTimeout(5000)
  
  const innerText = await page.evaluate(() =>  {
    return JSON.parse(document.querySelector("body").innerText); 
  });

  await browser.close();

  return innerText
  
}

// work
async function getRelated(bookID){
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.58')
  await page.goto(`${baseUrl}/api/gallery/${bookID}/related`, {waitUntil: "networkidle2"});
  await page.waitForTimeout(5000)
  
  const data = await page.evaluate(() => document.querySelector('*').outerHTML);
  await browser.close();
  return data 
}

// work
async function getPopularNow() {
  return scrape(baseUrl).then(async (res) => {
    const $ = cheerio.load(res, {
      decodeEntities: false,
    });

    let results = [];
    $(".index-popular .gallery").each((i, e) => {
      let $this = $(e);
      let id = $this
        .find(".cover")
        .attr("href")
        .match(/(?<=\/g\/).+(?=\/)/);
      let title = $this.find(".caption").html();
      let thumb = $this.find(".cover > img");
      let tags = $this.attr("data-tags").split(" ");

      let lang = tags.includes("6346")
        ? "japanese"
        : tags.includes("12227")
          ? "english"
          : tags.includes("29963")
            ? "chinese"
            : undefined;

      results.push({
        id: id[0],
        title: title,
        language: lang,
        thumbnail: {
          s:
            thumb.attr("data-src") ||
            thumb.attr("src").replace(/^\/\//, "https://"),
          w: thumb.attr("width"),
          h: thumb.attr("height"),
        },
      });
    });

    return {
      results,
    };
  });
}

// work
async function getList(url) {
  
  return scrape(url)
    .then((res) => {
      const $ = cheerio.load(res, {
        decodeEntities: false,
      });

      let results = [];
      $(".gallery").each((i, e) => {
        let $this = $(e);
        let id = $this
          .find(".cover")
          .attr("href")
          .match(/(?<=\/g\/).+(?=\/)/);
        let title = $this.find(".caption").html();
        let thumb = $this.find(".cover > img");
        let tags = $this.attr("data-tags").split(" ");

        let lang = tags.includes("6346")
          ? "japanese"
          : tags.includes("12227")
            ? "english"
            : tags.includes("29963")
              ? "chinese"
              : undefined;

        results.push({
          id: id[0],
          title: title,
          language: lang,
          thumbnail: {
            s:
              thumb.attr("data-src") ||
              thumb.attr("src").replace(/^\/\//, "https://"),
            w: thumb.attr("width"),
            h: thumb.attr("height"),
          },
        });
      });

      let paginationUrl = $(
        `.pagination>${
          $(".pagination>.last").length > 0 ? ".last" : ".current"
        }`
      ).attr("href");
      let numResults = $("#content>h1").text().replace(",", "");
      let extra = {};

      // getting total manga results
      if (isNaN(parseInt(numResults)))
        extra.num_results = parseInt($("meta[name='description']").attr("content").replace(",", "").match(/\d+/g));
      else
        extra.num_results = parseInt(numResults);

      // if there is no pagination on page, set num_pages to 1
      if (!paginationUrl) 
        extra.num_pages = 1;
      else
        extra.num_pages = parseInt(
          Qs.parse(paginationUrl.slice(paginationUrl.lastIndexOf("?") + 1))
            .page
        );

      return {
        ...extra,
        results,
      };
    });
}

// work
async function search(keyword, page = 1, popular = false){
  const qs = require("qs");
  let sort = getSort(popular);
    let query = qs.stringify({
      q: keyword,
      page,
    });
    let url = `${baseUrl}/search/?${query}${sort ? `&sort=${sort}` : ""}`;

    console.log(url)
    return getList(url);
}

// work
function getSort(sort) {
  // if popular param is false, send empty string
  if (sort == false) return "";
  // if popular param not false, get the right sort
  return sort == "all" || sort == true ? "popular" : `popular-${sort}`;
}

// work
async function random(){
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.58')
    await page.goto(`${baseUrl}/random`, {waitUntil: "networkidle2"});
    await page.waitForTimeout(5000)
    const url = await page.url(); 
    let result = await g(url)
    await browser.close();
    return result
    
}

// work
async function g(query) {
  if (typeof query == "number") query = query.toString();
  let id = query.includes(baseUrl)
    ? query.slice(`${baseUrl}/g/`.length).replace(/\//g, "")
    : query;
  return getBook(id);
}

// work
async function popular() {
  return getPopularNow();
}

// work
async function tag(keyword, page = 1, popular = false) {
  const Qs = require("qs");
  let sort = getSort(popular);
  let query = Qs.stringify({
    page,
  });
  let url = `${baseUrl}/tag/${modifyKeyword(keyword)}/${sort}?${query}`;

  return getList(url);
}

// not tested yet but should work
async function group(keyword, page = 1, popular = false) {
  const qs = require("qs");
  let sort = getSort(popular);
  let query = qs.stringify({
    page,
  });
  let url = `${baseUrl}/group/${keyword.replace(/ /g, "-")}/${sort}?${query}`;

  return getList(url);
}

// not tested yet but should work
async function artist(keyword, page = 1, popular = false) {
  const qs = require("qs");
  let sort = getSort(popular);
  let query = qs.stringify({
    page,
  });
  let url = `${baseUrl}/artist/${modifyKeyword(keyword)}/${sort}?${query}`;

  return getList(url);
}

// not tested yet but should work
async function character(keyword, page = 1, popular = false) {
  const qs = require("qs");
  let sort = getSort(popular);
  let query = qs.stringify({
    page,
  });
  let url = `${baseUrl}/character/${modifyKeyword(keyword)}/${sort}?${query}`;

  return getList(url);
}

//work
function modifyKeyword(keyword) {
  return keyword.replace(/ /g, "-").toLowerCase();
}