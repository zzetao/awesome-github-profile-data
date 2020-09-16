const path = require('path')
const puppeteer = require('puppeteer')
const sharp = require('sharp')
const { delay } = require('./utils')

const windowWidth = 1400
const minWindowHeight = 800

module.exports = async function capture(urls = [], successCallback) {
    if (urls.length === 0) return
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    for (let i = 0; i < urls.length; i++) {
        let url = urls[i]

        console.log('capture url', url)

        const page = await browser.newPage()
        try {
            await page.goto(url, { waitUntil: 'networkidle0' })
        } catch(e) {
            console.warn(e)
            continue
        }

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
            await delay(2000)
            continue
        }

        // limit height
        domHeight = Math.min(
            Math.max(domHeight, minWindowHeight),
            2000 // max height
        )

        const windowHeight = domHeight + 200

        await page.setViewport({
            width: windowWidth,
            height: windowHeight,
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

        const buffer = await page.screenshot({
            clip: {
                width: windowWidth,
                height: windowHeight - 92 - 2,
                x: 0,
                y: 92, // remove navbar
            },
        })

        const result = await sharp(buffer)
            .resize(800)
            .jpeg({
                quality: 50
            })
            .toFile(path.resolve(process.cwd(), filePath))

        successCallback({
            githubUrl: url,
            hasGif,
            filePath,
            height: result.height,
            width: result.width,
            size: result.size
        })

        await page.close()

        await delay(2000)
    }

    await browser.close()
}

function getFilePath(githubUrl) {
    let username = githubUrl.slice(githubUrl.lastIndexOf('/') + 1)
    return `screenshots/${username}.jpeg`
}
