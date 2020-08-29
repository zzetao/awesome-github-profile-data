const fs = require('fs')
const path = require('path')

const DATA_JSON_FILE_NAME = 'data.json'

function updateJSON(data, categoryName, item) {
    let category = data.find((item) => item.categoryName === categoryName)
    if (!category) {
        category = {
            categoryName,
            list: [],
        }
        data.push(category)
    }

    category.list.push(item)

    writeJSON(data)
}

function writeJSON(data) {
    fs.writeFile(
        path.resolve(process.cwd(), DATA_JSON_FILE_NAME),
        JSON.stringify(data, null, 2),
        function (err) {
            if (err) throw err
        }
    )
}

function getDataJSON() {
    try {
        return require(path.resolve(process.cwd(), DATA_JSON_FILE_NAME)) || []
    } catch (e) {
        return []
    }
}

function convertGithubUrl(url) {
    if (!url) return url
    let arr = url.split('/')
    let username = ''
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'github.com') {
            username = arr[i + 1]
            break
        }
    }

    return `https://github.com/${username}`
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

function delay(time = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

module.exports = {
    arrayDiff,
    convertGithubUrl,
    getDataJSON,
    writeJSON,
    updateJSON,
    delay
}