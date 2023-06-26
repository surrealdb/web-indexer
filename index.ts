import fs from "fs";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import puppeteer, { Page } from "puppeteer";
import { Surreal } from "surrealdb.js";
import { QueryResult, RawQueryResult } from "surrealdb.js/script/types";

const parseSitemap = async (db: Surreal, page: Page, sitemapPath: string) => {
  let xmlData: string;
  // The sitemap can be loaded from the website
  if (sitemapPath.startsWith("http")) {
    const response = await axios.get(sitemapPath);
    xmlData = response.data;
  } else {
    // Or from the local file system
    xmlData = fs.readFileSync(sitemapPath, "utf8");
  }

  const sitemap = await parseStringPromise(xmlData);
  const urls = sitemap.urlset.url;
  console.log(`The sitemap at "${sitemapPath}" contains ${urls.length} url(s)`);
  const locs: string[] = urls.map(
    (url: any) => url.loc[0] as unknown as string
  );
  for (const [index, loc] of locs.entries()) {
    console.log(`Crawling page ${index + 1}/${locs.length}: ${loc}`);
    await scrapPage(db, page, loc);
  }
  return locs.length;
};

const scrapPage = async (db: Surreal, page: Page, url: string) => {
  await page.goto(url, { waitUntil: "networkidle2" });

  const title = await page.title();

  // Extract H1:
  const h1 = extractText(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("h1"),
        (element) => element.textContent
      )
    )
  );

  // Extract H2:
  const h2 = extractText(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("h2"),
        (element) => element.textContent
      )
    )
  );

  // Extract H3:
  const h3 = extractText(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("h3"),
        (element) => element.textContent
      )
    )
  );

  // Extract H4:
  const h4 = extractText(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("h4"),
        (element) => element.textContent
      )
    )
  );

  // Extract code:
  const code = extractText(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("code"),
        (element) => element.textContent
      )
    )
  );

  // Extract every indexable text blocks
  const content = extractText(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("p,h1,h2,h3,h4,h5,h6,tr,th,td,code"),
        (element) => element.textContent
      )
    )
  );

  if (content.length > 0) {
    await indexPage(db, url, title, h1, h2, h3, h4, content, code);
  }
};

const extractText = (blocks: (string | null)[]) => {
  const text: string[] = [];
  for (const block of blocks) {
    if (block) {
      // Make the block prettier, by removing any extra spaces.
      const parts: string[] = block.split(/\s+/);
      const trimmedParts: string[] = parts.filter(Boolean); // This removes any empty strings
      const trimmedBlock: string = trimmedParts.join(" ");
      if (trimmedBlock.length > 0) {
        text.push(trimmedBlock);
      }
    }
  }
  return text;
};

const indexPage = async (
  db: Surreal,
  url: string,
  title: string,
  h1: string[],
  h2: string[],
  h3: string[],
  h4: string[],
  content: string[],
  code: string[]
) => {
  const u = new URL(url);
  const recordId = `page:⟨${u.pathname}⟩`;
  console.log(`Indexing "${recordId}"`);
  await db.delete(recordId);
  await db.create("page", {
    id: u.pathname,
    title,
    h1,
    h2,
    h3,
    h4,
    content,
    code,
  });
};

interface Config {
  sitemap: string;
  surreal: {
    url: string;
    ns: string;
    db: string;
    user: string;
    pass: string;
  };
}

const crawl = async (config: Config, db: Surreal) => {
  let browser;
  try {
    // Start the headless browser
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // Start the crawling
    const count = await parseSitemap(db, page, config.sitemap);
    console.log(`${count} page(s) crawled`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const initSurreal = async (config: Config): Promise<Surreal> => {
  // Connect to SurrealDB instance
  const db = new Surreal(config.surreal.url);

  // Signin as a namespace, database, or root user
  await db.signin({
    user: config.surreal.user,
    pass: config.surreal.pass,
  });

  // Select a specific namespace / database
  await db.use({ ns: config.surreal.ns, db: config.surreal.db });
  return db;
};

const displayResult = (res: QueryResult<RawQueryResult>[]) => {
  for (const r of res) {
    if (r.result) {
      console.log(r.result);
    }
  }
};

const initIndex = async (db: Surreal) => {
  const res = await db.query(
    "DEFINE ANALYZER simple TOKENIZERS blank,class,camel,punct FILTERS snowball(english);\
  DEFINE INDEX page_title ON page FIELDS title SEARCH ANALYZER simple BM25(1.2,0.75);\
  DEFINE INDEX page_h1 ON page FIELDS h1 SEARCH ANALYZER simple BM25(1.2,0.75);\
  DEFINE INDEX page_h2 ON page FIELDS h2 SEARCH ANALYZER simple BM25(1.2,0.75);\
  DEFINE INDEX page_h3 ON page FIELDS h3 SEARCH ANALYZER simple BM25(1.2,0.75);\
  DEFINE INDEX page_h4 ON page FIELDS h4 SEARCH ANALYZER simple BM25(1.2,0.75);\
  DEFINE INDEX page_content ON page FIELDS content SEARCH ANALYZER simple BM25(1.2,0.75) HIGHLIGHTS;\
  DEFINE INDEX page_code ON page FIELDS code SEARCH ANALYZER simple BM25(1.2,0.75);"
  );
  displayResult(res);
};

const search = async (db: Surreal, keywords: string | undefined) => {
  const sql = `SELECT \
  id, \
  title, \
  search::highlight('<b>', '</b>', 5) AS content, \
  search::score(0) * 6 + search::score(1) * 5 + search::score(2) * 4 \
  + search::score(3) * 3 + search::score(4) * 2 + search::score(5) AS score \
FROM page \
WHERE title @0@ '${keywords}' \
OR h1 @1@ '${keywords}' \
OR h2 @2@ '${keywords}' \
OR h3 @3@ '${keywords}' \
OR h4 @4@ '${keywords}' \
OR content @5@ '${keywords}' \
ORDER BY score DESC`;
  const res = await db.query(sql);
  displayResult(res);
};

const main = async () => {
  const [cmd, arg] = process.argv.slice(2);

  try {
    // Load the configuration
    const data = fs.readFileSync("config.json", "utf8");
    const config: Config = JSON.parse(data);

    // Connect to SurrealDB instance
    const db = await initSurreal(config);
    switch (cmd.toLocaleLowerCase()) {
      case "crawl":
        await crawl(config, db);
        break;
      case "init":
        await initIndex(db);
        break;
      case "search":
        await search(db, arg);
        break;
      default:
        console.error(`Unknown command ${cmd}`);
        break;
    }
  } finally {
    process.exit();
  }
};

main();
