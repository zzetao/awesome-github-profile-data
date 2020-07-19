const puppeteer = require('puppeteer')

const windowWidth = 1400
const minWindinHeight = 800

module.exports = async function capture(urls = [], successCallback) {
    if (urls.length === 0) return
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    for (let i = 0; i < urls.length; i++) {
        let url = urls[i]

        console.log('capture url', url)

        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'load' })

        await page.setViewport({
            width: windowWidth,
            height: 2000, // default height
        })

        // get readme dom height
        let domHeight = await page.evaluate(() => {
            const domPath =
                '#js-pjax-container > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.flex-shrink-0.col-12.col-md-9.mb-4.mb-md-0 > div:nth-child(2) > div > div.Box.mt-4'
            const box = document.querySelector(domPath)
            return box ? box.offsetHeight : 0
        })

        if (domHeight === 0) {
            console.warn('Unable to get dom, url: ', url)
            await wait(2000)
            continue
        }

        // min height
        domHeight = Math.max(domHeight, minWindinHeight)

        await page.setViewport({
            width: windowWidth,
            height: domHeight + 200,
        })

        // remove signup prompt
        await page.evaluate(() => {
            var prompt = document.getElementsByClassName('signup-prompt')[0]
            prompt.parentElement.removeChild(prompt)
        })

        // gif
        const hasGif = await page.evaluate(() => {
            const domPath =
                '#js-pjax-container > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.flex-shrink-0.col-12.col-md-9.mb-4.mb-md-0 > div:nth-child(2) > div > div.Box.mt-4 img'
            let nodeList = document.querySelectorAll(domPath)
            return [].slice
                .apply(nodeList)
                .some((node) => node.src.includes('.gif'))
        })

        let filePath = getFilePath(url)

        await page.screenshot({
            path: filePath,
            quality: 50,
            clip: {
                width: windowWidth,
                height: domHeight,
                x: 0,
                y: 92, // remove navbar
            },
        })

        successCallback({
            githubUrl: url,
            hasGif,
            filePath,
        })

        await page.close()

        await wait(2000)
    }

    await browser.close()
}

function getFilePath(githubUrl) {
    let now = +new Date()
    let username = githubUrl.slice(githubUrl.lastIndexOf('/') + 1)
    return `screenshots/${username}.jpeg`
}

function wait(time = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
