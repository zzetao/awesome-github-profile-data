const getLatestData = require('./markdown.js')
const capture = require('./capture.js')
const fs = require('fs')

let data = getDataJSON()

async function main() {
    let latestData = await getLatestData()

    // add properties
    latestData = latestData.map((category) => {
        category.list = category.list.map((item) => {
            item.categoryName = category.categoryName
            item.githubUrl = convertUrl(item.githubUrl)
            return item
        })
        return category
    })

    const diffData = arrayDiff(
        data.reduce((prev, item) => [...prev, ...item.list], []),
        latestData.reduce((prev, item) => [...prev, ...item.list], [])
    )

    await capture(
        diffData.map((item) => item.githubUrl),
        ({ githubUrl, hasGif, filePath }) => {
            // update data.json
            const item = diffData.find((cur) => cur.githubUrl === githubUrl)
            if (item) {
                let categoryName = item.categoryName
                delete item.categoryName

                item.hasGif = hasGif
                item.filePath = filePath
                item.timestamp = +new Date()

                writeJSON(categoryName, item)
            }
        }
    )
}

main()

function writeJSON(categoryName, item) {
    let category = data.find((item) => item.categoryName === categoryName)
    if (!category) {
        category = {
            categoryName,
            list: [],
        }
        data.push(category)
    }

    category.list.push(item)

    fs.writeFile('data.json', JSON.stringify(data, null, 2), function (err) {
        if (err) throw err
    })
}

function getDataJSON() {
    try {
        return require('./data.json') || []
    } catch (e) {
        return []
    }
}

function convertUrl(url) {
    return url.slice(0, url.lastIndexOf('/'))
}

function arrayDiff(left = [], right = []) {
    const set = new Set()
    left.forEach((item) => {
        set.add(item.githubUrl)
    })

    let res = []
    right.forEach((item) => {
        if (!set.has(item.githubUrl)) {
            res.push(item)
        }
    })

    return res
}
