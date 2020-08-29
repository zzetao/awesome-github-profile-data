const { writeJSON, getDataJSON } = require('./utils')
const capture = require('./capture.js')

main()

async function main() {
    const data = getDataJSON()
    const now = +new Date()

    const list = data.reduce((prev, item) => [...prev, ...item.list], [])
                     .filter(item => {
                        const days = (now - item.timestamp) / 1000 / 60 / 60 / 24
                        return days >= 15
                     })

    console.log('update count', list.length)

    await capture(
        list.map((item) => item.githubUrl),
        ({ githubUrl, hasGif, filePath, width, height }) => {
            // update data.json
            const item = list.find((cur) => cur.githubUrl === githubUrl)
            if (item) {
                item.hasGif = hasGif
                item.filePath = filePath
                item.timestamp = now
                item.width = width
                item.height = height

                writeJSON(data)
            }
        }
    )
}