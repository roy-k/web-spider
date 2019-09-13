import { si, SiConfig } from '../si'

// errors test

const rowListWithoutPage: SiConfig = {
    target: 'http://localhost:3098/page1.html',
    options: {
        selector: '.item-list',
        key: {
            selector: '.post-box-title a',

            selectorProps: {
                type: 'prop',
                name: 'href',
            },
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
    const data = await si(rowListWithoutPage)

    expect(data.length).toBe(10)

    const first = data[0]

    const { key, extraInfo = {} } = first

    expect(key).toMatch(/.+/)
    expect(extraInfo.title).toMatch(/.+/)
    expect(extraInfo.data).toMatch(/.+/)
    expect(extraInfo.views).toMatch(/.+/)
})

const rowListWithPage: SiConfig = {
    target: () => {
        return [1, 2, 3].map(page => `http://localhost:3098/page${page}.html`)
    },
    options: {
        selector: '.item-list',
        key: {
            selector: '.post-box-title a',

            selectorProps: {
                type: 'prop',
                name: 'href',
            },
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
test('collectRowList with pages', async () => {
    const data = await si(rowListWithPage)

    expect(data.length).toBe(30)
})
