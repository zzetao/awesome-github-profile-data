const rq = require('request-promise')
const readmeMdUrl =
    'https://raw.githubusercontent.com/abhisheknaiidu/awesome-github-profile-readme/master/README.md'
const Markdown = require('@dimerapp/markdown')

module.exports = async function getAwesomeGithubProfileData() {
    const mdText = await rq(readmeMdUrl)

    const md = new Markdown(mdText)
    const json = await md.toJSON()
    const children = json.contents.children
    const data = []
    for (let i = 0; i < children.length; i++) {
        let item = children[i]
        if (item.tag === 'h4') {
            data.push({
                categoryName: item.children[1].value,
                list: children[i + 1].children.map((child) => {
                    const children = child.children[0]
                    return {
                        githubUrl: children.props.href,
                        nickName: children.children[0].value,
                    }
                }),
            })
            i++
        }
    }
    return data
}
