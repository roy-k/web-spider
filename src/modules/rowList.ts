import c from 'ansi-colors'
import axios from 'axios'
import cheerio from 'cheerio'

type PageOptions = {
    selector: string
    /** 单项数据的 key 选择器 */
    // todo 多种多样的数据提取
    keySelector: string
    extraInfo?: {
        [props: string]: {
            key: string
            selector: string
        }
    }
    // 分页相关设计
    page?: {
        total?: string
        // * url | xhr 细节 ...
        composeUrlFn?: (pageNumber: number | string) => string
    }
}
function readPageData(pageData: string, options: PageOptions) {
    const {selector, keySelector, extraInfo, page} = options

    try {
        const $ = cheerio.load(pageData)

        const list = $(selector)

        console.log(`已匹配list: ${list.length}个`);

        return Array.from(list).map(item => {
            const key = $(item).find(keySelector).text()
            return {
                key,
            }
        })

    } catch (error) {
        console.log(c.red(`解析页面出错: ${error.toString()}`))
        throw ''
    }
}

export type CollectRowListConfig = {
    baseUrl: string
    /** 列表元素选择器 */
    selector: string
    /** 单项数据的 key 选择器 */
    // todo 多种多样的数据提取
    keySelector: string
    extraInfo?: {
        [props: string]: {
            key: string
            selector: string
        }
    }
    // 分页相关设计
    page?: {
        total?: string
        // * url | xhr 细节 ...
        composeUrlFn?: (pageNumber: number | string) => string
    }
    // todo 输出设计
}
export type CollectRowListResult = {
    key: string
    extraInfo?: {
        [props: string]: string
    }
}[]
export async function collectRowList(config: CollectRowListConfig): Promise<CollectRowListResult> {
    const { baseUrl, selector, keySelector, ...rest } = config

    if (!baseUrl || !selector || !keySelector) {
        console.log(c.bgRed('config error: baseUrl/selector/keySelector can not be empty'))
        return Promise.reject()
    }

    try {
        const { status, request, data } = await axios.get(baseUrl)

        if (status !== 200) {
            console.log(c.yellow(`页面请求错误 status: ${status}, request: ${request.toString()}`))
            return Promise.reject()
        }

        console.log(`页面请求完成, 开始解析数据`)

        const result = readPageData(data, {
            selector,
            keySelector,
            ...rest,
        })

        console.log('result: ', result);

        return result
    } catch (error) {
        console.log(c.red(error.toString()))

        if (error) {
        }
    }

    return []
}
