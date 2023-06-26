# surrealdb-web-indexer

## Setup

It is a NodeJS application:

```bash
npm install
```

## Start a SurrealDB instance

 Following the [Getting Started]( https://surrealdb.com/docs/introduction/start)

If you want to run it from the code (and a branch):

```bash
cargo run --no-default-features -F storage-mem -- start --log trace --user root --pass root memory
```

You may want to prepare a CLI connected to the instance:

```bash
cargo run sql --conn http://localhost:8000 --user root --pass root --ns test --db test
```

## Update `config.json` with the right parameters

The sitemap can be either a path to a local file, or an url. Eg.: `https://www.surrealdb.com/sitemap.xml`
```json
{
    "sitemap": "sitemap.xml",
    "surreal": {
        "url": "http://127.0.0.1:8000/rpc",
        "ns": "test",
        "db": "test",
        "user": "root",
        "pass": "root"
    }
}
```

## Create an analyzer and a full-text index

Using the CLI, create an an analyzer and an few indexes:

```sql
DEFINE ANALYZER simple TOKENIZERS blank,class,camel,punct FILTERS snowball(english);
DEFINE INDEX page_title ON page FIELDS title SEARCH ANALYZER simple BM25(1.2,0.75);
DEFINE INDEX page_path ON page FIELDS path SEARCH ANALYZER simple BM25(1.2,0.75);
DEFINE INDEX page_h1 ON page FIELDS h1 SEARCH ANALYZER simple BM25(1.2,0.75);
DEFINE INDEX page_h2 ON page FIELDS h2 SEARCH ANALYZER simple BM25(1.2,0.75);
DEFINE INDEX page_h3 ON page FIELDS h3 SEARCH ANALYZER simple BM25(1.2,0.75);
DEFINE INDEX page_h4 ON page FIELDS h4 SEARCH ANALYZER simple BM25(1.2,0.75);
DEFINE INDEX page_content ON page FIELDS content SEARCH ANALYZER simple BM25(1.2,0.75) HIGHLIGHTS;
DEFINE INDEX page_code ON page FIELDS code SEARCH ANALYZER simple BM25(1.2,0.75);
```

Alternatively you may use the npm script:

```bash
  npm run init
```


### Crawl and index the website:

Start the npm script:

```bash
npm run crawl

> surrealdb-web-indexer@1.0.0 start
> ts-node index.ts

The sitemap at "sitemap.xml" contains 9 url(s)
Crawling page https://surrealdb.com
Indexing "page:https://surrealdb.com"
Crawling page https://surrealdb.com/install
Indexing "page:https://surrealdb.com/install"
Crawling page https://surrealdb.com/community
Indexing "page:https://surrealdb.com/community"
Crawling page https://surrealdb.com/docs
Indexing "page:https://surrealdb.com/docs"
Crawling page https://surrealdb.com/docs/introduction
Indexing "page:https://surrealdb.com/docs/introduction"
Crawling page https://surrealdb.com/docs/surrealql
Indexing "page:https://surrealdb.com/docs/surrealql"
Crawling page https://surrealdb.com/docs/surrealql/comments
Indexing "page:https://surrealdb.com/docs/surrealql/comments"
Crawling page https://surrealdb.com/docs/surrealql/datamodel
Indexing "page:https://surrealdb.com/docs/surrealql/datamodel"
Crawling page https://surrealdb.com/docs/surrealql/datamodel/ids
Indexing "page:https://surrealdb.com/docs/surrealql/datamodel/ids"
9 page(s) crawled
```

## 4. Execute a full-text search query

You can use the provided npm script:

```bash
  npm search "install linux"
```

Or use the CLI and execute a SELECT statement with a match operator (@{ref}@) and the `search::highlight` function.

```sql
  SELECT
    id,
    title,
    search::highlight('<b>', '</b>', 5) AS content,
    search::score(0) * 7 + search::score(1) * 6 + search::score(2) * 5 + search::score(3) * 4
    + search::score(4) * 3 + search::score(5) * 2 + search::score(6) AS score
  FROM page
  WHERE title @0@ 'install linux'
  OR path @1@ 'install linux'
  OR h1 @2@ 'install linux'
  OR h2 @3@ 'install linux'
  OR h3 @4@ 'install linux'
  OR h4 @5@ 'install linux'
  OR content @6@ 'install linux')
  ORDER BY score DESC
```

Which should return something like this:

<details><summary>Click to expand</summary>

```js
[
  {
    content: [
      '| Join us in September',
      'Install on macOS',
      'Install on Linux',
      'Install on Windows',
      'Run using Docker'
    ],
    id: 'page:⟨/install⟩',
    score: 97.50522899627686,
    title: 'SurrealDB | Install'
  },
  {
    content: [
      '| Join us in September',
      'Updating SurrealDB',
      'Checking SurrealDB'
    ],
    id: 'page:⟨/docs/installation/linux⟩',
    score: 88.69011163711548,
    title: 'SurrealDB | Documentation'
  },
  {
    content: '| Join us in September',
    id: 'page:⟨/docs/installation/nightly⟩',
    score: 57.08628225326538,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      '| Join us in September',
      'macOS',
      'Linux',
      'Windows',
      'Install SurrealDB Nightly',
      'Run with Docker',
      'Run a single-node, in-memory server',
      'Run a single-node, on-disk server',
      'Run a multi-node, scalable cluster with TiKV',
      'From beta-8 to beta-9'
    ],
    id: 'page:⟨/docs/installation⟩',
    score: 55.03691244125366,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      '| Join us in September',
      'Updating SurrealDB',
      'Checking SurrealDB',
      'Updating SurrealDB',
      'Updating SurrealDB'
    ],
    id: 'page:⟨/docs/installation/windows⟩',
    score: 45.858017444610596,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      '| Join us in September',
      'Updating SurrealDB',
      'Checking SurrealDB',
      'Updating SurrealDB',
      'Checking SurrealDB'
    ],
    id: 'page:⟨/docs/installation/macos⟩',
    score: 43.358386516571045,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      'Sign In Required',
      'Launching GitHub Desktop',
      'Launching GitHub Desktop',
      'Launching Xcode',
      'Launching Visual Studio Code',
      'Install on macOS',
      'Install on Linux',
      'Install on Windows',
      'Run using Docker',
      'Database, API, and permissions',
      'Tables, documents, and graph',
      'Advanced inter-document relations and analysis. No JOINs. No pain.',
      'Simple schema definition for frontend and backend development',
      'Connect and query directly from web-browsers and client devices',
      'Query the database with the tools you want',
      'Realtime live queries and data changes direct to application',
      'Scale effortlessly to hundreds of nodes for high-availability and scalability',
      'Extend your database with JavaScript functions',
      'Designed to be embedded or to run distributed in the cloud'
    ],
    id: 'page:⟨/github⟩',
    score: 15.236974477767944,
    title: 'GitHub - surrealdb/surrealdb: A scalable, distributed, collaborative, document-graph database, for the realtime web'
  },
  {
    content: [ '| Join us in September', 'macOS or Linux', 'Windows' ],
    id: 'page:⟨/docs/introduction/start⟩',
    score: 11.371832609176636,
    title: 'SurrealDB | Documentation'
  },
  {
    content: '| Join us in September',
    id: 'page:⟨/docs/deployment/kubernetes⟩',
    score: 3.510430335998535,
    title: 'SurrealDB | Documentation'
  }
]
```

</details>