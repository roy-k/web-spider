import { SiConfig } from '../types'
import * as getPageData from '../src/modules/getPageData'
import * as readPageData from '../src/modules/readPageData'

import si from '../src/si'

jest.mock('../src/modules/getPageData')
jest.mock('../src/modules/readPageData')

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
    },
}
test('single page', async () => {
    await si(rowListWithoutPage)

    expect(getPageData.getPageData).toHaveBeenCalled()
    expect(getPageData.getPageData).toHaveBeenCalledTimes(1)

    expect(readPageData.getFieldsFromPageData).toHaveBeenCalled()
    expect(readPageData.getFieldsFromPageData).toHaveBeenCalledTimes(1)
})

const rowListWithPage: SiConfig = {
    target: () => {
        return [1, 2].map(page => `http://localhost:3098/page${page}.html`)
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
    },
}
test('muti pages', async () => {
    await si(rowListWithPage)

    // 加上上面1次
    expect(getPageData.getPageData).toHaveBeenCalledTimes(3)
    expect(readPageData.getFieldsFromPageData).toHaveBeenCalledTimes(3)
})
