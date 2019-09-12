import { collectRowList, CollectRowListConfig } from '../rowList'

const rowListWithoutPage: CollectRowListConfig = {
    baseUrl: 'http://localhost:3098/home.html',
    pageOptions: {
        selector: '.item-list',
        keySelector: '.post-box-title a',
        selectorProps: {
            type: 'prop',
            name: 'href',
        },
        extraInfo: {
            title: {
                selector: '.post-box-title a',
            },
            data: {
                selector: '.post-meta .tie-date',
            },
            views: {
                selector: '.post-meta .post-views',
                selectorProps: {
                    formatter: (text: string) => text.trim()
                }
            },
        },
    },
}
test('collectRowList normal', async () => {
    const data = await collectRowList(rowListWithoutPage)

    expect(data.length).toBe(10)

    const first = data[0]

    const { key, extraInfo = {} } = first

    expect(key).toMatch(/.+/)
    expect(extraInfo.title).toMatch(/.+/)
    expect(extraInfo.data).toMatch(/.+/)
    expect(extraInfo.views).toMatch(/.+/)
})
