import c from 'ansi-colors'
import axios from 'axios'
import cheerio from 'cheerio'
import Async from 'async'
import { flatten } from 'lodash'

type SelectorProps = {
    type?: 'text' | 'prop' | 'attr'
    name?: string
    formatter?: (text: string) => string
}

type OptionsConfig = {
    selector: string
    /** 单项数据的 key 选择器 */
    // todo 多种多样的数据提取
    keySelector: string
    selectorProps?: SelectorProps
    extraInfo?: {
        [props: string]: {
            selector: string
            selectorProps?: SelectorProps
        }
    }
    // 分页相关设计
    page?: {
        /** 1. 选定页面 (适用于测试或只有单独一层数据时) */
        range?: [number, number]
        /** 2. 动态 */
        // * url | xhr 细节 ...
        composeUrlFn: (baseUrl: string, pageNumber: number | string) => string
    }
    filter?: (text: string) => boolean
}
function readPageData(pageData: string, options: OptionsConfig) {
    const { selector, keySelector, selectorProps, extraInfo, page } = options

    try {
        const $ = cheerio.load(pageData)

        const list = $(selector)

        console.log(`已匹配list: ${list.length}个`)

        return Array.from(list).map(item => {
            const $Item = $(item)
            const keyEl = $Item.find(keySelector)

            let res: CollectRowListItem = { key: '' }

            let key: string

            // todo 可以提取出来
            if (!selectorProps) {
                res.key = keyEl.text()
            } else {
                const { type, name, formatter } = selectorProps

                let value = ''

                if (!type || type === 'text') {
                    value = keyEl.text()
                    if (name) {
                        console.log(c.yellow('when selectorProps.type = "text", name need not be set'))
                    }
                } else {
                    if (!name) {
                        console.log(c.red('when selectorProps.type = "text", name must be set'))
                    }
                    value = name && keyEl[type](name)
                }

                res.key = formatter ? formatter(value) : value
            }

            if (extraInfo) {
                res.extraInfo = {}

                Object.keys(extraInfo).forEach(key => {
                    const { selector, selectorProps } = extraInfo[key]

                    const infoEl = $Item.find(selector)

                    if (!selectorProps) {
                        res.extraInfo![key] = infoEl.text()
                    } else {
                        const { type, name, formatter } = selectorProps

                        let value = ''

                        if (!type || type === 'text') {
                            value = infoEl.text()
                            if (name) {
                                console.log(c.yellow('when selectorProps.type = "text", name need not be set'))
                            }
                        } else {
                            if (!name) {
                                console.log(c.red('when selectorProps.type = "text", name must be set'))
                            }
                            value = name && infoEl[type](name)
                        }

                        res.extraInfo![key] = formatter ? formatter(value) : value
                    }
                })
            }

            return res
        })
    } catch (error) {
        console.log(c.red(`解析页面出错: ${error.toString()}`))
        throw ''
    }
}

export type CollectRowListConfig = {
    baseUrl: string
    /** 列表元素选择器 */
    options: OptionsConfig
}
export type CollectRowListItem = {
    key: string
    extraInfo?: {
        [props: string]: string
    }
}
async function collectRowList(config: CollectRowListConfig): Promise<CollectRowListItem[]> {
    const { baseUrl, options } = config

    try {
        const { status, request, data } = await axios.get(baseUrl)

        if (status !== 200) {
            console.log(c.yellow(`页面请求错误 status: ${status}, request: ${request.toString()}`))
            return Promise.reject()
        }

        console.log(`页面请求完成, 开始解析数据`)

        const result = readPageData(data, options)

        return result
    } catch (error) {
        console.log(c.red(error.toString()))

        return []
    }
}

async function queueCollectRow(config: CollectRowListConfig, urls: string[]): Promise<CollectRowListItem[]> {
    // todo async 抽取相关

    try {
        return await new Promise((resolve, reject) => {
            Async.mapSeries(
                urls,
                async (baseUrl, callback) => {
                    const pageList = await collectRowList({ ...config, baseUrl })

                    callback(null, pageList)
                },
                (err, data) => {
                    if (err) {
                        console.log('queue error: ', err, data)

                        resolve([])
                    }

                    if (!data) {
                        resolve([])
                    }

                    const flatData = flatten(data) as CollectRowListItem[]

                    resolve(flatData)
                }
            )
        })
    } catch (error) {
        return []
    }
}

// todo 分发类型
export async function collectRow(config: CollectRowListConfig) {
    const { baseUrl, options } = config
    const { selector, keySelector, page } = options

    // 参数检测
    if (!baseUrl || !selector || !keySelector) {
        console.log(c.bgRed('config error: baseUrl/selector/keySelector can not be empty'))
        return Promise.reject()
    }

    // 分页处理
    if (page) {
        const { range, composeUrlFn } = page

        // 区间
        if (range) {
            //
            const [start, end] = range
            const len = end - start + 1

            if (!len || len <= 0) {
                console.log(c.red(`error range: [${start}, ${end}]`))
                throw 'error range'
            }

            const urls = Array(len)
                .fill(true)
                .map((e, index) => {
                    return composeUrlFn(baseUrl, start + index)
                })

            return await queueCollectRow(config, urls)
        }

        return []
    } else {
        // 单页数据
        return await collectRowList(config)
    }
}
