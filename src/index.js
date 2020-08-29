const getLatestData = require('./markdown.js')
const capture = require('./capture.js')

const { arrayDiff, convertGithubUrl, getDataJSON, updateJSON } = require('./utils')

let data = getDataJSON()

main()

async function main() {
    /**
     * { categoryName, list: [ { githubUrl, nickName } ] }
     */
    let latestData = await getLatestData()

    // add properties
    latestData = latestData.map((category) => {
        category.list = category.list.map((item) => {
            item.categoryName = category.categoryName
            item.githubUrl = convertGithubUrl(item.githubUrl)
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
        ({ githubUrl, hasGif, filePath, width, height }) => {
            // update data.json
            const item = diffData.find((cur) => cur.githubUrl === githubUrl)
            if (item) {
                let categoryName = item.categoryName
                delete item.categoryName

                item.hasGif = hasGif
                item.filePath = filePath
                item.timestamp = +new Date()
                item.width = width
                item.height = height

                updateJSON(data, categoryName, item)
            }
        }
    )
}
