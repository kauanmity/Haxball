const puppeteer = require("puppeteer");

//Pupperteer haxball
(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "./user-data-dir",
        args: ["--disable-features=WebRtcHideLocalIpsWithMdns"],
    });
    const page = await browser.newPage();

    page
        .on('console', message =>
        console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
        .on('pageerror', ({ message }) => console.log(message))
        .on('response', response =>
        console.log(`${response.status()} ${response.url()}`))
        .on('requestfailed', request =>
        console.log(`${request.failure().errorText} ${request.url()}`))

    const client = await page.target().createCDPSession();

    await client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: "./downloads",
    });

    await page.goto("https://haxball.com/headless", {
        waitUntil: "networkidle2",
    });

    page.addScriptTag({ path: "./haxball.js" });

    //Json-server
    const jsonServer = require('json-server')
    const server = jsonServer.create()
    const router = jsonServer.router('db.json')
    const middlewares = jsonServer.defaults()
    server.use(middlewares)
    server.use(router)
    server.listen(3000, () => {
    console.log('JSON Server is running')
})
})();