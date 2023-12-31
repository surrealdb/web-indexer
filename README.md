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
    search::highlight('<b>', '</b>', 6) AS content,
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
  LIMIT 10
```

Which should return something like this:

<details><summary>Click to expand</summary>

```js
[
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      '<b>Install</b>',
      'There are a number of ways of running SurrealDB. It can either be <b>installed</b> from a binary image, or it can be run from within Docker. Once <b>installed</b>, the surreal command is a single executable which can be used to backup, interact with, and run SurrealDB server instances.',
      'surreal',
      'After <b>installing</b> with any of the available options. Check out the getting started guide',
      '<b>Install</b> on macOS',
      "The quickest way to get going with SurrealDB on macOS is to use Homebrew. This will <b>install</b> both the command-line tools, and the SurrealDB server as a single executable. If you don't use Homebrew, follow the instructions for <b>Linux</b> below to <b>install</b> SurrealDB. View the documentation for more information.",
      'brew <b>install</b> surrealdb/tap/surreal',
      '<b>Install</b> on <b>Linux</b>',
      'The easiest and preferred way to get going with SurrealDB on Unix operating systems is to <b>install</b> and use the SurrealDB command-line tool. Run the following command in your terminal and follow the on-screen instructions. View the documentation for more information.',
      'curl -sSf https://<b>install</b>.surrealdb.com | sh',
      '<b>Install</b> on Windows',
      'The easiest and preferred way to get going with SurrealDB on Windows is to <b>install</b> and use the SurrealDB command-line tool. Run the following command in your terminal and follow the on-screen instructions. View the documentation for more information.',
      'iwr https://windows.surrealdb.com -useb | iex',
      'Alternatively SurrealDB is available for <b>installation</b>, on Windows, via the Chocolatey package manager, from an administrative shell - enabling easy <b>installation</b> and upgrading.',
      'choco <b>install</b> surreal --pre',
      'Alternatively SurrealDB is available for <b>installation</b>, on Windows, via the Scoop package manager, from an administrative shell - enabling easy <b>installation</b> and upgrading.',
      'scoop <b>install</b> surreal',
      'Run using Docker',
      'Docker can be used to manage and run SurrealDB database instances without the need to <b>install</b> any command-line tools. The SurrealDB docker container contains the full command-line tools for importing and exporting data from a running server, or for running a server itself. View the documentation for more information.',
      'docker run --rm --pull always -p 8000:8000 surrealdb/surrealdb:latest start',
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/install⟩',
    score: 103.08830308914185,
    title: 'SurrealDB | Install'
  },
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      '<b>Install</b> on <b>Linux</b>',
      'Use this tutorial to <b>install</b> SurrealDB on <b>Linux</b> or Unix operating systems using the SurrealDB <b>install</b> script. Both the SurrealDB Database Server and the SurrealDB Command Line Tool are packaged and distributed as a single executable file, which is easy to <b>install</b>, and easy to uninstall.',
      '<b>Installing</b> SurrealDB using the <b>install</b> script',
      'To get started, you can use the SurrealDB <b>install</b> script. This script securely downloads the latest version for the platform and CPU type. It attempts to <b>install</b> SurrealDB into the /usr/local/bin folder, falling back to a user-specified folder if necessary.',
      '/usr/local/bin',
      "user@localhost % curl --proto '=https' --tlsv1.2 -sSf https://<b>install</b>.surrealdb.com | sh",
      'Updating SurrealDB',
      'To ensure that you are using the latest version, update SurrealDB to version v1.0.0-beta.9+20230402 using the following command.',
      'v1.0.0-beta.9+20230402',
      "user@localhost % curl --proto '=https' --tlsv1.2 -sSf https://<b>install</b>.surrealdb.com | sh",
      'Checking SurrealDB',
      'Once <b>installed</b>, you can run the SurrealDB command-line tool by using the surreal command. To check whether the <b>install</b> was successful run the following command in your terminal.',
      'surreal',
      'user@localhost % surreal help',
      'The result should look similar to the output below, confirming that the SurrealDB command-line tool was <b>installed</b> successfully.',
      ".d8888b. 888 8888888b. 888888b. d88P Y88b 888 888 'Y88b 888 '88b Y88b. 888 888 888 888 .88P 'Y888b. 888 888 888d888 888d888 .d88b. 8888b. 888 888 888 8888888K. 'Y88b. 888 888 888P' 888P' d8P Y8b '88b 888 888 888 888 'Y88b '888 888 888 888 888 88888888 .d888888 888 888 888 888 888 Y88b d88P Y88b 888 888 888 Y8b. 888 888 888 888 .d88P 888 d88P 'Y8888P' 'Y88888 888 888 'Y8888 'Y888888 888 8888888P' 8888888P' SurrealDB command-line interface and server To get started using SurrealDB, and for guides on connecting to and building applications on top of SurrealDB, check out the SurrealDB documentation (https://surrealdb.com/docs). If you have questions or ideas, join the SurrealDB community (https://surrealdb.com/community). If you find a bug, submit an issue on Github (https://github.com/surrealdb/surrealdb/issues). We would love it if you could star the repository (https://github.com/surrealdb/surrealdb). ---------- USAGE: surreal [SUBCOMMAND] OPTIONS: -h, --help Print help information SUBCOMMANDS: start Start the database server backup Backup data to or from an existing database import Import a SQL script into an existing database export Export an existing database into a SQL script version Output the command-line tool version information sql Start an SQL REPL in your terminal with pipe support help Print this message or the help of the given subcommand(s)",
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/docs/installation/linux⟩',
    score: 94.86924076080322,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      '<b>Install</b> SurrealDB Nightly',
      'If you prefer developing on the bleeding edge, you can follow this tutorial to <b>install</b> SurrealDB Nightly. The nightly version is built and released every night at midnight, and includes the latest features, and bug fixes. The nightly version is available for macOS, <b>Linux</b>, and Windows operating systems, and can be <b>installed</b> using the <b>Linux</b> or Unix <b>install</b> script, or using the Windows <b>install</b> script. Alternatively you can run the nightly version with Docker by using the nightly tag.',
      'nightly',
      '<b>Installing</b> SurrealDB Nightly on macOS',
      'To get started, you can use the SurrealDB <b>install</b> script. This script securely downloads the latest version for the platform and CPU type. It attempts to <b>install</b> SurrealDB into the /usr/local/bin folder, falling back to a user-specified folder if necessary. The following command will attempt to <b>install</b> the nightly version. You can re-run this command daily to ensure you are running the latest build of SurrealDB.',
      '/usr/local/bin',
      "user@localhost % curl --proto '=https' --tlsv1.2 -sSf https://<b>install</b>.surrealdb.com | sh -s -- --nightly",
      '<b>Installing</b> SurrealDB Nightly on <b>Linux</b>',
      'To get started, you can use the SurrealDB <b>install</b> script. This script securely downloads the latest version for the platform and CPU type. It attempts to <b>install</b> SurrealDB into the /usr/local/bin folder, falling back to a user-specified folder if necessary. The following command will attempt to <b>install</b> the nightly version. You can re-run this command daily to ensure you are running the latest build of SurrealDB.',
      '/usr/local/bin',
      "user@localhost % curl --proto '=https' --tlsv1.2 -sSf https://<b>install</b>.surrealdb.com | sh -s -- --nightly",
      '<b>Installing</b> SurrealDB Nightly on Windows',
      'To get started, you can use the SurrealDB <b>install</b> script. This script securely downloads the latest version for the platform and CPU type. It <b>installs</b> SurrealDB into the C:\\Program Files\\SurrealDB folder, falling back to a user-specified folder if necessary. The following command will attempt to <b>install</b> the nightly version. You can re-run this command daily to ensure you are running the latest build of SurrealDB.',
      'C:\\Program Files\\SurrealDB',
      'PS C:\\> iex "& { $(irm https://windows.surrealdb.com) } -Nightly"',
      'Using SurrealDB Nightly with Docker',
      'To use SurrealDB Nightly with Docker, you can use the nightly tag. When running the following command, the latest SurrealDB Nightly version will be pulled from Docker Hub.',
      'nightly',
      'user@localhost % docker run --rm --pull always -p 8000:8000 surrealdb/surrealdb:nightly start',
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/docs/installation/nightly⟩',
    score: 62.036728858947754,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      '<b>Installation</b>',
      "Getting started with SurrealDB is intended to be quick and easy. All of SurrealDB's functionality for starting a server, and importing and exporting data, is enabled through the command-line tool, packaged and distributed as a single executable file, which can be downloaded, <b>installed</b>, or run from within Docker.",
      '<b>Installing</b>',
      'macOS',
      'Follow this tutorial to <b>install</b> SurrealDB on macOS operating systems',
      '<b>Linux</b>',
      'Follow this tutorial to <b>install</b> SurrealDB on <b>Linux</b> operating systems',
      'Windows',
      'Follow this tutorial to <b>install</b> SurrealDB on Windows operating systems',
      '<b>Install</b> SurrealDB Nightly',
      'If you prefer developing on the bleeding edge, you can use SurrealDB Nightly, which includes the latest features, built and released every night',
      'Running',
      'Run with Docker',
      'Follow this tutorial to get started with SurrealDB using the Docker container management system or the Docker Compose orchestration tool',
      'Run a single-node, in-memory server',
      'Follow this tutorial to get started with a single-node, in-memory server instance for testing and development',
      'Run a single-node, on-disk server',
      'Follow this tutorial to get started with a single-node, in-disk server instance for vertical scaling',
      'Run a multi-node, scalable cluster with TiKV',
      'Follow this tutorial to get started with a single-node, in-disk server instance for horizontal scaling',
      'Upgrading',
      'From beta-8 to beta-9',
      'Follow this guide to get started upgrading from beta-8 to beta-9',
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/docs/installation⟩',
    score: 60.44818592071533,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      '<b>Install</b> on Windows',
      'Use this tutorial to <b>install</b> SurrealDB on Windows operating systems using the SurrealDB <b>install</b> script, or using the third-party Chocolatey or third-party Scoop package managers. Both the SurrealDB Database Server and the SurrealDB Command Line Tool are packaged and distributed as a single executable file, which is easy to <b>install</b>, and easy to uninstall.',
      '<b>Installing</b> SurrealDB using the <b>install</b> script',
      'To get started, you can use the SurrealDB <b>install</b> script. This script securely downloads the latest version for the platform and CPU type. It <b>installs</b> SurrealDB into the C:\\Program Files\\SurrealDB folder, falling back to a user-specified folder if necessary.',
      'C:\\Program Files\\SurrealDB',
      'PS C:\\> iwr https://windows.surrealdb.com -useb | iex',
      'Updating SurrealDB',
      'To ensure that you are using the latest version, update SurrealDB to version v1.0.0-beta.9+20230402 using the following command.',
      'v1.0.0-beta.9+20230402',
      'PS C:\\> iwr https://windows.surrealdb.com -useb | iex',
      'Checking SurrealDB',
      'Once <b>installed</b>, you can run the SurrealDB command-line tool by using the surreal.exe command. To check whether the <b>install</b> was successful run the following command in your terminal.',
      'surreal.exe',
      'PS C:\\> C:\\Program Files\\SurrealDB\\surreal.exe help',
      'The result should look similar to the output below, confirming that the SurrealDB command-line tool was <b>installed</b> successfully.',
      ".d8888b. 888 8888888b. 888888b. d88P Y88b 888 888 'Y88b 888 '88b Y88b. 888 888 888 888 .88P 'Y888b. 888 888 888d888 888d888 .d88b. 8888b. 888 888 888 8888888K. 'Y88b. 888 888 888P' 888P' d8P Y8b '88b 888 888 888 888 'Y88b '888 888 888 888 888 88888888 .d888888 888 888 888 888 888 Y88b d88P Y88b 888 888 888 Y8b. 888 888 888 888 .d88P 888 d88P 'Y8888P' 'Y88888 888 888 'Y8888 'Y888888 888 8888888P' 8888888P' SurrealDB command-line interface and server To get started using SurrealDB, and for guides on connecting to and building applications on top of SurrealDB, check out the SurrealDB documentation (https://surrealdb.com/docs). If you have questions or ideas, join the SurrealDB community (https://surrealdb.com/community). If you find a bug, submit an issue on Github (https://github.com/surrealdb/surrealdb/issues). We would love it if you could star the repository (https://github.com/surrealdb/surrealdb). ---------- USAGE: surreal [SUBCOMMAND] OPTIONS: -h, --help Print help information SUBCOMMANDS: start Start the database server backup Backup data to or from an existing database import Import a SQL script into an existing database export Export an existing database into a SQL script version Output the command-line tool version information sql Start an SQL REPL in your terminal with pipe support help Print this message or the help of the given subcommand(s)",
      '<b>Installing</b> SurrealDB using Chocolatey',
      "If you use the chocolately package manaher, then you can quickly <b>install</b> SurrealDB with one command. This will <b>install</b> both the command-line tools, and the SurrealDB server as a single executable. If you don't use Homebrew, follow the instructions for <b>Linux</b> below to <b>install</b> SurrealDB.",
      'PS C:\\> choco <b>install</b> surrealdb',
      'Updating SurrealDB',
      'To ensure that you are using the latest version, update SurrealDB to version v1.0.0-beta.9+20230402 using the following command.',
      'v1.0.0-beta.9+20230402',
      'PS C:\\> choco update surrealdb',
      '<b>Installing</b> SurrealDB using Scoop',
      'If you use the Scoop package manager, then you can quickly <b>install</b> SurrealDB with one command. This will <b>install</b> both the command-line tools, and the SurrealDB server as a single executable.',
      'PS C:\\> scoop <b>install</b> surrealdb',
      'Updating SurrealDB',
      'To ensure that you are using the latest version, update SurrealDB to version v1.0.0-beta.9+20230402 using the following command.',
      'v1.0.0-beta.9+20230402',
      'PS C:\\> scoop update surrealdb',
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/docs/installation/windows⟩',
    score: 50.52293062210083,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      '<b>Install</b> on macOS',
      'Use this tutorial to <b>install</b> SurrealDB on macOS using the SurrealDB <b>install</b> script, or using the third-party Homebrew package manager. Both the SurrealDB Database Server and the SurrealDB Command Line Tool are packaged and distributed as a single executable file, which is easy to <b>install</b>, and easy to uninstall.',
      '<b>Installing</b> SurrealDB using the <b>install</b> script',
      'To get started, you can use the SurrealDB <b>install</b> script. This script securely downloads the latest version for the platform and CPU type. It attempts to <b>install</b> SurrealDB into the /usr/local/bin folder, falling back to a user-specified folder if necessary.',
      '/usr/local/bin',
      "user@localhost % curl --proto '=https' --tlsv1.2 -sSf https://<b>install</b>.surrealdb.com | sh",
      'Updating SurrealDB',
      'To ensure that you are using the latest version, update SurrealDB to version v1.0.0-beta.9+20230402 using the following command.',
      'v1.0.0-beta.9+20230402',
      "user@localhost % curl --proto '=https' --tlsv1.2 -sSf https://<b>install</b>.surrealdb.com | sh",
      'Checking SurrealDB',
      'Once <b>installed</b>, you can run the SurrealDB command-line tool by using the surreal command. To check whether the <b>install</b> was successful run the following command in your terminal.',
      'surreal',
      'user@localhost % surreal help',
      'The result should look similar to the output below, confirming that the SurrealDB command-line tool was <b>installed</b> successfully.',
      ".d8888b. 888 8888888b. 888888b. d88P Y88b 888 888 'Y88b 888 '88b Y88b. 888 888 888 888 .88P 'Y888b. 888 888 888d888 888d888 .d88b. 8888b. 888 888 888 8888888K. 'Y88b. 888 888 888P' 888P' d8P Y8b '88b 888 888 888 888 'Y88b '888 888 888 888 888 88888888 .d888888 888 888 888 888 888 Y88b d88P Y88b 888 888 888 Y8b. 888 888 888 888 .d88P 888 d88P 'Y8888P' 'Y88888 888 888 'Y8888 'Y888888 888 8888888P' 8888888P' SurrealDB command-line interface and server To get started using SurrealDB, and for guides on connecting to and building applications on top of SurrealDB, check out the SurrealDB documentation (https://surrealdb.com/docs). If you have questions or ideas, join the SurrealDB community (https://surrealdb.com/community). If you find a bug, submit an issue on Github (https://github.com/surrealdb/surrealdb/issues). We would love it if you could star the repository (https://github.com/surrealdb/surrealdb). ---------- USAGE: surreal [SUBCOMMAND] OPTIONS: -h, --help Print help information SUBCOMMANDS: start Start the database server backup Backup data to or from an existing database import Import a SQL script into an existing database export Export an existing database into a SQL script version Output the command-line tool version information sql Start an SQL REPL in your terminal with pipe support help Print this message or the help of the given subcommand(s)",
      '<b>Installing</b> SurrealDB using Homebrew',
      "The quickest way to get going with SurrealDB on macOS is to use Homebrew. This will <b>install</b> both the command-line tools, and the SurrealDB server as a single executable. If you don't use Homebrew, follow the instructions for <b>Linux</b> below to <b>install</b> SurrealDB.",
      'user@localhost % brew <b>install</b> surrealdb/tap/surreal',
      'Updating SurrealDB',
      'To ensure that you are using the latest version, update SurrealDB to version v1.0.0-beta.9+20230402 using the following command.',
      'v1.0.0-beta.9+20230402',
      'user@localhost % brew upgrade surrealdb/tap/surreal',
      'Checking SurrealDB',
      'Once <b>installed</b>, you can run the SurrealDB command-line tool by using the surreal command. To check whether the <b>install</b> was successful run the following command in your terminal.',
      'surreal',
      'user@localhost % surreal help',
      'The result should look similar to the output below, confirming that the SurrealDB command-line tool was <b>installed</b> successfully.',
      ".d8888b. 888 8888888b. 888888b. d88P Y88b 888 888 'Y88b 888 '88b Y88b. 888 888 888 888 .88P 'Y888b. 888 888 888d888 888d888 .d88b. 8888b. 888 888 888 8888888K. 'Y88b. 888 888 888P' 888P' d8P Y8b '88b 888 888 888 888 'Y88b '888 888 888 888 888 88888888 .d888888 888 888 888 888 888 Y88b d88P Y88b 888 888 888 Y8b. 888 888 888 888 .d88P 888 d88P 'Y8888P' 'Y88888 888 888 'Y8888 'Y888888 888 8888888P' 8888888P' SurrealDB command-line interface and server To get started using SurrealDB, and for guides on connecting to and building applications on top of SurrealDB, check out the SurrealDB documentation (https://surrealdb.com/docs). If you have questions or ideas, join the SurrealDB community (https://surrealdb.com/community). If you find a bug, submit an issue on Github (https://github.com/surrealdb/surrealdb/issues). We would love it if you could star the repository (https://github.com/surrealdb/surrealdb). ---------- USAGE: surreal [SUBCOMMAND] OPTIONS: -h, --help Print help information SUBCOMMANDS: start Start the database server backup Backup data to or from an existing database import Import a SQL script into an existing database export Export an existing database into a SQL script version Output the command-line tool version information sql Start an SQL REPL in your terminal with pipe support help Print this message or the help of the given subcommand(s)",
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/docs/installation/macos⟩',
    score: 47.74777173995972,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      'A scalable, distributed, collaborative, document-graph database, for the realtime web',
      'License',
      'surrealdb/surrealdb',
      'Name already in use',
      'Use Git or checkout with SVN using the web URL.',
      'Work fast with our official CLI. Learn more about the CLI.',
      'Sign In Required',
      'Please sign in to use Codespaces.',
      'Launching GitHub Desktop',
      'If nothing happens, download GitHub Desktop and try again.',
      'Launching GitHub Desktop',
      'If nothing happens, download GitHub Desktop and try again.',
      'Launching Xcode',
      'If nothing happens, download Xcode and try again.',
      'Launching Visual Studio Code',
      'Your codespace will open once ready.',
      'There was a problem preparing your codespace, please try again.',
      'Latest commit',
      'Request.prototype.text',
      'e0f885e',
      'Git stats',
      'Files',
      'v4',
      'v7',
      'Request.prototype.text',
      'surrealdb',
      'README.md',
      "is the ultimate cloud database for tomorrow's applications",
      'Develop easier. Build faster. Scale quicker.',
      'What is SurrealDB?',
      'SurrealDB is an end-to-end cloud-native database designed for modern applications, including web, mobile, serverless, Jamstack, backend, and traditional applications. With SurrealDB, you can simplify your database and API infrastructure, reduce development time, and build secure, performant apps quickly and cost-effectively.',
      'Key features of SurrealDB include:',
      'View the features, the latest releases, the product roadmap, and documentation.',
      'Contents',
      'Features',
      'Documentation',
      'For guidance on <b>installation</b>, development, deployment, and administration, see our documentation.',
      '<b>Installation</b>',
      'SurrealDB is designed to be simple to <b>install</b> and simple to run - using just one command from your terminal. In addition to traditional <b>installation</b>, SurrealDB can be <b>installed</b> and run with HomeBrew, Docker, or using any other container orchestration tool such as Docker Compose, Docker Swarm, Rancher, or in Kubernetes.',
      '<b>Install</b> on macOS',
      "The quickest way to get going with SurrealDB on macOS is to use Homebrew. This will <b>install</b> both the command-line tools, and the SurrealDB server as a single executable. If you don't use Homebrew, follow the instructions for <b>Linux</b> below to <b>install</b> SurrealDB.",
      '<b>Install</b> on <b>Linux</b>',
      'The easiest and preferred way to get going with SurrealDB on Unix operating systems is to <b>install</b> and use the SurrealDB command-line tool. Run the following command in your terminal and follow the on-screen instructions.',
      "If you want a binary newer than what's currently released, you can <b>install</b> the nightly one.",
      '<b>Install</b> on Windows',
      'The easiest and preferred way to get going with SurrealDB on Windows is to <b>install</b> and use the SurrealDB command-line tool. Run the following command in your terminal and follow the on-screen instructions.',
      'Run using Docker',
      'Docker can be used to manage and run SurrealDB database instances without the need to <b>install</b> any command-line tools. The SurrealDB docker container contains the full command-line tools for importing and exporting data from a running server, or for running a server itself.',
      'For just getting started with a development server running in memory, you can pass the container a basic initialization to set the user and password as root and enable logging.',
      'Getting started',
      'Getting started with SurrealDB is as easy as starting up the SurrealDB database server, choosing your platform, and integrating its SDK into your code. You can easily get started with your platform of choice by reading one of our tutorials.',
      'Client side apps',
      'Server side code',
      'Quick look',
      'With strongly-typed data types, data can be fully modelled right in the database.',
      'Store dynamically computed fields which are calculated when retrieved.',
      'Easily work with unstructured or structured data, in schema-less or schema-full mode.',
      'Connect records together with fully directed graph edge connections.',
      'Query data flexibly with advanced expressions and graph queries.',
      'Store GeoJSON geographical data types, including points, lines and polygons.',
      'Write custom embedded logic using JavaScript functions.',
      'Specify granular access permissions for client and application access.',
      'Why SurrealDB?',
      'Database, API, and permissions',
      "SurrealDB combines the database layer, the querying layer, and the API and authentication layer into one platform. Advanced table-based and row-based customisable access permissions allow for granular data access patterns for different types of users. There's no need for custom backend code and security rules with complicated database development.",
      'Tables, documents, and graph',
      'As a multi-model database, SurrealDB enables developers to use multiple techniques to store and model data, without having to choose a method in advance. With the use of tables, SurrealDB has similarities with relational databases, but with the added functionality and flexibility of advanced nested fields and arrays. Inter-document record links allow for simple to understand and highly-performant related queries without the use of JOINs, eliminating the N+1 query problem.',
      'Advanced inter-document relations and analysis. No JOINs. No pain.',
      'With full graph database functionality SurrealDB enables more advanced querying and analysis. Records (or vertices) can be connected to one another with edges, each with its own record properties and metadata. Simple extensions to traditional SQL queries allow for multi-table, multi-depth document retrieval, efficiently in the database, without the use of complicated JOINs and without bringing the data down to the client.',
      'Simple schema definition for frontend and backend development',
      'With SurrealDB, specify your database and API schema in one place, and define column rules and constraints just once. Once a schema is defined, database access is automatically granted to the relevant users. No more custom API code, and no more GraphQL integration. Simple, flexible, and ready for production in minutes not months.',
      'Connect and query directly from web-browsers and client devices',
      'Connect directly to SurrealDB from any end-user client device. Run SurrealQL queries directly within web-browsers, ensuring that users can only view or modify the data that they are allowed to access. Highly-performant WebSocket connections allow for efficient bi-directional queries, responses and notifications.',
      'Query the database with the tools you want',
      'Your data, your choice. SurrealDB is designed to be flexible to use, with support for SurrealQL, GraphQL (coming soon), CRUD support over REST, and JSON-RPC querying and modification over WebSockets. With direct-to-client connection with in-built permissions, SurrealDB speeds up the development process, and fits in seamlessly into any tech stack.',
      'Realtime live queries and data changes direct to application',
      'SurrealDB keeps every client device in-sync with data modifications pushed in realtime to the clients, applications, end-user devices, and server-side libraries. Live SQL queries allow for advanced filtering of the changes to which a client subscribes, and efficient data formats, including DIFFing and PATCHing enable highly-performant web-based data syncing.',
      'Scale effortlessly to hundreds of nodes for high-availability and scalability',
      'SurrealDB can be run as a single in-memory node, or as part of a distributed cluster - offering highly-available and highly-scalable system characteristics. Designed from the ground up to run in a distributed environment, SurrealDB makes use of special techniques when handling multi-table transactions, and document record IDs - with no use of table or row locks.',
      'Extend your database with JavaScript functions',
      'Embedded JavaScript functions allow for advanced, custom functionality, with computation logic being moved to the data layer. This improves upon the traditional approach of moving data to the client devices before applying any computation logic, ensuring that only the necessary data is transferred remotely. These advanced JavaScript functions, with support for the ES2020 standard, allow any developer to analyse the data in ever more simple-yet-advanced ways.',
      'Designed to be embedded or to run distributed in the cloud',
      'Built entirely in Rust as a single library, SurrealDB is designed to be used as both an embedded database library with advanced querying functionality, and as a database server which can operate in a distributed cluster. With low memory usage and cpu requirements, the system requirements have been specifically thought through for running in all types of environment.',
      'Community',
      'Join our growing community around the world, for help, ideas, and discussions regarding SurrealDB.',
      'Contributing',
      'We would for you to get involved with SurrealDB development! If you wish to help, you can learn more about how you can contribute to this project in the contribution guide.',
      'Security',
      'For security issues, view our vulnerability policy, view our security policy, and kindly email us at security@surrealdb.com instead of posting a public issue on GitHub.',
      'License',
      'Source code for SurrealDB is variously licensed under a number of different licenses. A copy of each license can be found in each repository.',
      'For more information, see the licensing information.',
      'About',
      'A scalable, distributed, collaborative, document-graph database, for the realtime web',
      'Topics',
      'Resources',
      'License',
      'Code of conduct',
      'Security policy',
      'Stars',
      ... 8 more items
    ],
    id: 'page:⟨/github⟩',
    score: 16.174237728118896,
    title: 'GitHub - surrealdb/surrealdb: A scalable, distributed, collaborative, document-graph database, for the realtime web'
  },
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      'Getting started',
      'In this guide, we will walk you through <b>installing</b> SurrealDB on your machine, defining your schema, and writing some queries with SurrealQL.',
      'Start the database',
      'First ensure that your database is set up correctly. To do so, run:',
      'user@localhost % surreal version ## 1.0.0-beta.9+20230402.5eafebd',
      'To start your database, run the start command specific to your machine.',
      'macOS or <b>Linux</b>',
      'user@localhost % surreal start --user root --pass root memory',
      'Windows',
      'PS C:\\> surreal.exe start --user root --pass root memory',
      "Here's what each segment of this command does:",
      'surreal start',
      '--user root --pass root',
      'root',
      'memory',
      'Using SurrealQL',
      'Using SurrealQL, you can query data from your SurrealDB database. While this is not a requirement for getting started, it is helpful to familiarise yourself with some commands.',
      'Once you have your database running, head over to Surrealist.app, which defaults to your local http://localhost:8000/. Using Surrealist, you can try out the following commands:',
      'http://localhost:8000/',
      'CREATE',
      'CREATE',
      'The create command is used to add records to the database.',
      "CREATE account SET name = 'ACME Inc', created_at = time::now() ;",
      'The account record will be created, and a random ID has been generated for this record. In SurrealDB every record can be created and accessed directly by its ID.',
      'account',
      'In SurrealDB, every record can be created and accessed directly by its ID. In the following query, we will create a record, but will use a specific ID.',
      "CREATE author:john SET name.first = 'John', name.last = 'Adams', name.full = string::join(' ', name.first, name.last), age = 29, admin = true, signup_at = time::now() ;",
      'You can also link records to each other by creating a mutual record, for example, create a blog article record, which links to the author and account tables. In the following example we link to the author record directly by its ID, and we link to the account record with a subquery which searches using the name field.',
      'name',
      "Let's now create a blog article record, which links to the author and account tables. In the following example we link to the author record directly by its ID, and we link to the account record with a subquery which gives us the ID for ACME Inc.",
      'author',
      'account',
      "CREATE article SET created_at = time::now(), author = author:john, title = 'Lorem ipsum dolor', text = 'Donec eleifend, nunc vitae commodo accumsan, mauris est fringilla.', account = (SELECT VALUE id FROM account WHERE name = 'ACME Inc' LIMIT 1)[0] ;",
      'Querying data with SELECT',
      'SELECT',
      'The querying functionality in SurrealDB works similarly to a traditional SQL, but with many of the added benefits of NoSQL query languages. To retrieve data, we will use a SELECT query. You can query all the articles in your records and this will also return the record links.',
      'SELECT',
      'SELECT * FROM article;',
      "Also in SurrealDB we can retrieve data from multiple different tables or records at once. In the example below we'll retrieve data from both the 'article' and the 'account' table in one query.",
      'SELECT * FROM article, account;',
      'Also, Instead of pulling data from multiple tables and merging that data together, SurrealDB allows you to traverse related records efficiently without needing to use JOINs. In the following example, we will get all the articles where the author is younger than 30. In order to get the information for the author age for our filter condition we need to fetch the relevant records from the author table.',
      'SELECT * FROM article WHERE author.age < 30 FETCH author, account;',
      'UPDATE',
      'UPDATE',
      'Similar to UPDATE in SQL you can also update specific IDs, for example say you wanted to update the first name of the author you can do so:',
      "UPDATE person:john SET name = 'David'",
      'you can also update specific fields:',
      "UPDATE person:john SET admin = false WHERE name.last = 'Adams';",
      'DELETE',
      'DELETE',
      'You can also delete specific records DELETE person:david. You could also delete a record with specific conditions:',
      'DELETE',
      "DELETE article WHERE author = 'David';",
      'REMOVE',
      'REMOVE',
      'You can also remove a specific table using the REMOVE TABLE:',
      'REMOVE TABLE',
      'REMOVE TABLE person',
      'Congratulations, you’re now on your way to database and API simplicity! For the next steps, take a look at some of our in-depth guides to see some of the other advanced functionality that you can use in SurrealDB.',
      'Learn more',
      'By completing this guide you have successfully set up a SurrealDB database and ran some SurrealQL queries. To learn more about SurrealQL, refer to the SurrealQL guides.',
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/docs/introduction/start⟩',
    score: 12.233445882797241,
    title: 'SurrealDB | Documentation'
  },
  {
    content: [
      'Product',
      'Community',
      '| Join us in September',
      'Understand why SurrealDB is the ultimate cloud database.',
      "Get a detailed overview of all of SurrealDB's technical features.",
      'Keep track of the notable updates and improvements for every SurrealDB product release in chronological order.',
      'See what we have planned for SurrealDB, and see the features and functionality which has already been implemented.',
      'Deploy on Kubernetes',
      'In this guide, we will deploy SurrealDB to KIND (Kubernetes in Docker) using TiKV as the storage engine: TiKV is a cloud-native transactional key/value store that integrates well with Kubernetes thanks to their tidb-operator.',
      'At the end, we will run a few experiments using SurrealQL to verify that we can interact with the new cluster and will destroy some Kubernetes pods to see that data is highly available.',
      'Requirements',
      'For this guide, we need to <b>install</b>:',
      'kubectl',
      'helm',
      'KIND',
      'Docker',
      'Surreal CLI',
      'Create KIND Cluster',
      'KIND',
      'First, we need to create a KIND cluster. KIND is a tool for running local Kubernetes clusters using Docker container “nodes”. It’s a great tool for experimenting with Kubernetes without spending a lot of time creating a full-featured cluster.',
      'KIND',
      'Run the following command to create a cluster:',
      'Let’s create a new cluster:',
      '$ kind create cluster -n surreal-demo',
      'Verify we can interact with the created cluster',
      '$ kubectl config current-context kind-surreal-demo $ kubectl get ns NAME STATUS AGE default Active 79s kube-node-lease Active 79s kube-public Active 79s kube-system Active 79s local-path-storage Active 75s',
      'Deploy TiDB operator',
      'Now that we have a Kubernetes cluster, we can deploy the TiDB operator . TiDB operator is a Kubernetes operator that manages the lifecycle of TiDB clusters deployed to Kubernetes.',
      'TiDB',
      'You can deploy it following these steps:',
      '<b>Install</b> CRDS:',
      '$ kubectl create -f https://raw.githubusercontent.com/pingcap/tidb-operator/v1.4.4/manifests/crd.yaml',
      '<b>Install</b> TiDB Operator Helm chart:',
      '$ helm repo add pingcap https://charts.pingcap.org $ helm repo update $ helm <b>install</b> \\ -n tidb-operator \\ --create-namespace \\ tidb-operator \\ pingcap/tidb-operator \\ --version v1.4.4',
      'Verify that the Pods are running:',
      '$ kubectl get pods --namespace tidb-operator -l app.kubernetes.io/instance=tidb-operato r NAME READY STATUS RESTARTS AGE tidb-controller-manager-56f49794d7-hnfz7 1/1 Running 0 20s tidb-scheduler-8655bcbc86-66h2d 2/2 Running 0 20s',
      'Create TiDB cluster',
      'Now that we have the TiDB Operator running, it’s time to define a TiDB Cluster and let the Operator do the rest. One of the TiDB Cluster components is the TiKV, which we are interested in. Given this is a demo, we will use a basic example cluster, but there are several examples in the official GitHub repo in case you need a more production-grade deployment',
      'Given this is a demo, we will use a basic example cluster, but there are several examples in the official GitHub repo in case you need a more production-grade deployment',
      'Run the following commands to deploy the TiKV cluster:',
      'Create a namespace for the TiDB cluster:',
      'TiDB cluster',
      '$ kubectl create ns tikv',
      'Create the TiDB cluster:',
      '$ kubectl apply -n tikv -f https://raw.githubusercontent.com/pingcap/tidb-operator/v1.4.4/examples/basic/tidb-cluster.yaml',
      'Check the cluster status and wait until it’s ready:',
      '$ kubectl get -n tikv tidbcluster NAME READY PD STORAGE READY DESIRE TIKV STORAGE READY DESIRE TIDB READY DESIRE AGE basic False pingcap/pd:v6.5.0 1Gi 1 1 1Gi 1 1 41s $ kubectl get -n tikv tidbcluster NAME READY PD STORAGE READY DESIRE TIKV STORAGE READY DESIRE TIDB READY DESIRE AGE basic True pingcap/pd:v6.5.0 1Gi 1 1 pingcap/tikv:v6.5.0 1Gi 1 1 pingcap/tidb:v6.5.0 1 1 5m',
      'Deploy SurrealDB',
      'Now that we have a TiDB cluster running, we can deploy SurrealDB. For this guide, we will use the SurrealDB Helm chart. Run the following commands to deploy SurrealDB:',
      'For this guide, we will use the SurrealDB Helm chart. Run the following commands to deploy SurrealDB:',
      'Add the SurrealDB Charts repository:',
      '$ helm repo add surrealdb https://helm.surrealdb.com $ helm repo update',
      'Get the TIKV PD service url:',
      '$ kubectl get -n tikv svc/basic-pd NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE basic-pd ClusterIP 10.96.208.25 <none> 2379/TCP 10h $ export TIKV_URL=tikv://basic-pd.tikv:2379',
      '<b>Install</b> the SurrealDB Helm chart with the TIKV_URL defined above:',
      '$ helm <b>install</b> --set surrealdb.path=$TIKV_URL surrealdb-tikv surrealdb/surrealdb',
      'Verify that the SurrealDB Pods are running:',
      `$ kubectl logs -f deployments/surrealdb-tikv 2023-06-06T08:07:47.982960Z INFO surrealdb::env: Running 1.0.0-beta.9+20230401.c3773b2 for <b>linux</b> on aarch64 2023-06-06T08:07:47.982988Z INFO surrealdb::iam: Root authentication is enabled 2023-06-06T08:07:47.982990Z INFO surrealdb::iam: Root username is 'root' 2023-06-06T08:07:47.982991Z INFO surrealdb::dbs: Database strict mode is disabled 2023-06-06T08:07:47.983023Z INFO surrealdb::kvs: Connecting to kvs store at tikv://basic-pd.tikv:2379 2023-06-06T08:07:47.999548Z INFO surrealdb::kvs: Connected to kvs store at tikv://basic-pd.tikv:2379 2023-06-06T08:07:47.999667Z INFO surrealdb::net: Starting web server on 0.0.0.0:8000 2023-06-06T08:07:47.999758Z INFO surrealdb::net: Started web server on 0.0.0.0:8000 2023-06-06T08:07:48.617919Z INFO surrealdb::net: 10.244.0.1:49264 GET /health HTTP/1.1 200 "kube-probe/1.27" 1.238584ms`,
      'Run SurrealDB experiments',
      'Now that we have SurrealDB running, we can run some experiments to verify that everything is working as expected. For this guide, we will use the Surreal CLI. Run the following commands to run some experiments:',
      'For this guide, we will use the Surreal CLI. Run the following commands to run some experiments:',
      'Start port-forwarding to the SurrealDB service:',
      '$ kubectl port-forward svc/surrealdb-tikv 8000 Forwarding from 127.0.0.1:8000 -> 8000 Forwarding from [::1]:8000 -> 8000',
      'Connect to the SurrealDB server using the CLI from another shell:',
      "$ surreal sql --conn 'http://localhost:8000' --user root --pass surrealdb",
      'Create a SurrealDB database:',
      "$ surreal sql --conn 'http://localhost:8000' --user root --pass surrealdb > USE NS ns DB db; ns/db> CREATE record; { id: record:wbd69kmc81l4fbee7pit } ns/db> CREATE record; { id: record:vnyfsr22ovhmmtcm5y1t } ns/db> CREATE record; { id: record:se49petzb7c4bc7yge0z } ns/db> SELECT * FROM record; [{ id: record:se49petzb7c4bc7yge0z }, { id: record:vnyfsr22ovhmmtcm5y1t }, { id: record:wbd69kmc81l4fbee7pit }] ns/db>",
      'The data created above has been persisted to the TiKV cluster. Let’s verify it by deleting the SurrealDB server and let Kubernetes recreate it.',
      '$ kubectl get pod NAME READY STATUS RESTARTS AGE surrealdb-tikv-7488f6f654-lsrwp 1/1 Running 0 13m $ kubectl delete pod surrealdb-tikv-7488f6f654-lsrwp pod "surrealdb-tikv-7488f6f654-lsrwp" deleted $ kubectl get pod NAME READY STATUS RESTARTS AGE surrealdb-tikv-7488f6f654-bnkjz 1/1 Running 0 4s',
      'Connect again and verify the data is still there (you may need to re-run the port-forwarding command):',
      "$ surreal sql --conn 'http://localhost:8000' --user root --pass surrealdb > USE NS ns DB db; ns/db> SELECT * FROM record; [{ id: record:se49petzb7c4bc7yge0z }, { id: record:vnyfsr22ovhmmtcm5y1t }, { id: record:wbd69kmc81l4fbee7pit }] ns/db>",
      'Given we are using KIND, we use port-forwarding for demonstration purposes. In a full-featured Kubernetes cluster, you could set ingress.enabled=true when <b>installing</b> the SurrealDB Helm Chart and it would create a Load Balancer in front of the SurrealDB server pods.',
      'port-forwarding',
      'In a full-featured Kubernetes cluster, you could set ingress.enabled=true when <b>installing</b> the SurrealDB Helm Chart and it would create a Load Balancer in front of the SurrealDB server pods.',
      'ingress.enabled=true',
      'Conclusion',
      'This guide demonstrated how to deploy SurrealDB on Kubernetes using TiKV as a datastore. From here, you could try and deploy to EKS , GKE or AKS , and play with the different configurations for the TiKV cluster.',
      'EKS',
      'GKE',
      'AKS',
      'To contribute to this documentation, edit this file on GitHub.',
      'With an SQL-style query language, real-time queries with highly-efficient related data retrieval, advanced security permissions for multi-tenant access, and support for performant analytical workloads, SurrealDB is the next generation serverless database.',
      'Product',
      'Community',
      'Legal',
      'About',
      'Copyright © SurrealDB Ltd. Registered in England and Wales, no. 13615201 Registered address: Huckletree Oxford Circus, 213 Oxford Street, London, W1D 2LG'
    ],
    id: 'page:⟨/docs/deployment/kubernetes⟩',
    score: 4.429085731506348,
    title: 'SurrealDB | Documentation'
  }
]
```

</details>