const { JSDOM } = require("jsdom");

async function crawlPage(baseUrl, currentUrl, pages) {
    const baseUrlObj = new URL(baseUrl);
    const currentUrlObj = new URL(currentUrl);

    if (baseUrlObj.hostname !== currentUrlObj.hostname) {
        return pages;
    }
    const normalizedCurrentUrl = normalizeUrl(currentUrl);

    if (pages[normalizedCurrentUrl] > 0) {
        pages[normalizedCurrentUrl]++;

        return pages;
    }
    pages[normalizedCurrentUrl] = 1;

    console.log("starting crawling");

    try {
        const res = await fetch(currentUrl);

        if (res.status > 399) {
            console.log(`error in fetch, status:${res.status}`);
            return pages;
        }
        const contentType = res.headers.get("content-type");

        if (!contentType.includes("text/html")) {
            console.log("no html provided");
            return pages;
        }

        const htmlBody = await res.text();

        const nextURLs = getURLsFromHtml(htmlBody, baseUrl);
        for (const nextURL of nextURLs) {
            pages = await crawlPage(baseUrl, nextURL, pages);
        }
    } catch (error) {
        console.log(error);
    }
    return pages;
}

function getURLsFromHtml(htmlBody, baseUrl) {
    const url = [];
    const dom = new JSDOM(htmlBody);

    const linkEle = dom.window._document.querySelectorAll("a");

    for (const ele of linkEle) {
        let urlString = "";
        if (ele.href.slice(0, 1) === "/") {
            urlString = `${baseUrl}${ele.href}`;
        } else {
            urlString = ele.href;
        }
        const urlObj = new URL(urlString);
        url.push(urlObj.href);
    }
    return url;
}

function normalizeUrl(url) {
    const urlObj = new URL(url);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
        return hostPath.slice(0, -1);
    }
    return url.hostname;
}
module.exports = {
    crawlPage,
    getURLsFromHtml,
    normalizeUrl,
};
