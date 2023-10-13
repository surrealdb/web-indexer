import fs from "fs";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import puppeteer, { Page } from "puppeteer";
import { Surreal } from "surrealdb.js";

const parseSitemap = async (db: Surreal, page: Page, sitemapPath: string, overrideHost: string) => {
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
    (url: any) => 
      replaceHost(url.loc[0] as unknown as string, overrideHost)
  );
  for (const [index, loc] of locs.entries()) {
    console.log(`Crawling page ${index + 1}/${locs.length}: ${loc}`);
    await scrapPage(db, page, loc);
  }
  return locs.length;
};

function replaceHost(urlString: string, newHost: string) {
  if (!newHost) {
    return urlString;
  }
  const url = new URL(urlString);
  url.host = newHost;
  return url.toString();
}

const scrapPage = async (db: Surreal, page: Page, url: string) => {
  const response = await page.goto(url, { waitUntil: "networkidle2" });

  if (!response) {
    console.warn('No response');
    return;
  }

  const status = response.status();
  if (status != 200) {
    console.warn(`Unexpected status: ${status} - ${response.statusText}`);
    return;
  }

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
  const path = u.pathname;
  const recordId = `page:⟨${path}⟩`;
  console.log(`Indexing "${recordId}"`);
  await db.delete(recordId);
  const start = Date.now();
  await db.create("page", {
    id: u.pathname,
    title,
    path,
    h1,
    h2,
    h3,
    h4,
    content,
    code,
  });
  const elapsed = Date.now() - start;
  console.log(`Elapsed time: ${elapsed} ms`);
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
  override_host: string;
}

const crawl = async (config: Config, db: Surreal) => {
  console.log(`Crawl ${config.sitemap}`);
  let browser;
  try {
    // Start the headless browser
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // Start the crawling
    const count = await parseSitemap(db, page, config.sitemap, config.override_host);
    console.log(`${count} page(s) crawled`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const initSurreal = async (config: Config): Promise<Surreal> => {
  // Connect to SurrealDB instance
  const db = new Surreal();

  // Connect to the database
  await db.connect(config.surreal.url);

  const password = config.surreal.pass || process.env.SDB_PASS;
  if (!password) {
    throw 'The password is empty';
  }

  // Signin as a namespace, database, or root user
  await db.signin({
    user: config.surreal.user,
    pass: password,
  });

  // Select a specific namespace / database
  await db.use({ ns: config.surreal.ns, db: config.surreal.db });
  return db;
};

const execute = async (db: Surreal, sql: string) => {
  const start = Date.now();
  const res = await db.query(sql);
  const elapsed = Date.now() - start;
  for (const r of res) {
    if (r.status == 'ERR') {
      console.error(`ERR: ${r.detail}`);
    }
    if (r.status == 'OK') {
      console.log(r.result);
    } 
  }
  console.log(`Elapsed time: ${elapsed} ms`);
};

const initIndex = async (db: Surreal) => {
  console.log('Create index');
  const sql = "DEFINE ANALYZER simple TOKENIZERS blank,class,camel,punct FILTERS snowball(english);\
  DEFINE INDEX page_title ON page FIELDS title SEARCH ANALYZER simple BM25;\
  DEFINE INDEX page_path ON page FIELDS path SEARCH ANALYZER simple BM25;\
  DEFINE INDEX page_h1 ON page FIELDS h1 SEARCH ANALYZER simple BM25;\
  DEFINE INDEX page_h2 ON page FIELDS h2 SEARCH ANALYZER simple BM25;\
  DEFINE INDEX page_h3 ON page FIELDS h3 SEARCH ANALYZER simple BM25;\
  DEFINE INDEX page_h4 ON page FIELDS h4 SEARCH ANALYZER simple BM25;\
  DEFINE INDEX page_content ON page FIELDS content SEARCH ANALYZER simple BM25 HIGHLIGHTS;\
  DEFINE INDEX page_code ON page FIELDS code SEARCH ANALYZER simple BM25;";
  await execute(db, sql);
};

const search = async (db: Surreal, keywords: string | undefined) => {
  const sql = `SELECT \
    id, \
    title, \
    search::highlight('<b>', '</b>', 6) AS content, \
    search::score(0) * 7 + search::score(1) * 6 + search::score(2) * 5 + search::score(3) * 4 \
    + search::score(4) * 3 + search::score(5) * 2 + search::score(6) AS score \
  FROM page \
  WHERE title @0@ '${keywords}' \
    OR path @1@ '${keywords}' \
    OR h1 @2@ '${keywords}' \
    OR h2 @3@ '${keywords}' \
    OR h3 @4@ '${keywords}' \
    OR h4 @5@ '${keywords}' \
    OR content @6@ '${keywords}' \
  ORDER BY score DESC LIMIT 10`;
  await execute(db, sql);
};

const fast = async (db: Surreal, keywords: string | undefined) => {
  const sql = `SELECT \
    id, \
    title, \
    search::highlight('<b>', '</b>', 0) AS content, \
    search::score(0) AS score \
  FROM page \
  WHERE content @0@ '${keywords}' \
  ORDER BY score DESC LIMIT 10`;
  await execute(db, sql);
};

const main = async () => {
  console.log('Starting');
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
      case "fast":
          await fast(db, arg);
          break;
      default:
        console.error(`Unknown command ${cmd}`);
        break;
    }
  } catch (err) {
    console.error(err);
  } finally {
    console.log('Exit');
    process.exit();
  }
};

main();
