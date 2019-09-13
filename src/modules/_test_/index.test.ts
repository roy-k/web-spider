import { collectRow, CollectRowListConfig } from '../rowList'

// errors test

const rowListWithoutPage: CollectRowListConfig = {
    baseUrl: 'http://localhost:3098/page1.html',
    options: {
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
                    formatter: (text: string) => text.trim(),
                },
            },
        },
    },
}
test('collectRowList normal', async () => {
    const data = await collectRow(rowListWithoutPage)

    expect(data.length).toBe(10)

    const first = data[0]

    const { key, extraInfo = {} } = first

    expect(key).toMatch(/.+/)
    expect(extraInfo.title).toMatch(/.+/)
    expect(extraInfo.data).toMatch(/.+/)
    expect(extraInfo.views).toMatch(/.+/)
}, 30000)

const rowListWithPage: CollectRowListConfig = {
    baseUrl: 'http://localhost:3098',
    options: {
        selector: '.item-list',
        keySelector: '.post-box-title a',
        selectorProps: {
            type: 'prop',
            name: 'href',
        },
        page: {
            range: [1, 3],
            composeUrlFn(baseUrl, pageNumber) {
                return `${baseUrl}/page${pageNumber}.html`
            },
        },
    },
}
test('collectRowList with pages', async () => {
    const data = await collectRow(rowListWithPage)

    expect(data.length).toBe(30)
}, 30000)
