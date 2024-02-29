const { crawlPage } = require("./crawl");
async function main() {
    if (process.argv.length < 3) {
        console.log("no website");
        process.exit(1);
    }
    if (process.argv.length > 3) {
        console.log("to much params");
        process.exit(1);
    }
    try {
        const baseUrl = process.argv[2];
        const result = await crawlPage(baseUrl, baseUrl, {});

        console.log(result);
    } catch (err) {
        console.log("bad url");
    }
}

main();
