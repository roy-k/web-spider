import c from 'ansi-colors'
import axios from 'axios'
import cheerio from 'cheerio'
import Async from 'async'
import { flatten } from 'lodash'
import { sleep } from 'src/util'

export type TargetGenerator = () => string[]

export type SiTarget = string | string[] | TargetGenerator

export type SelectorProps = {
    type?: 'text' | 'prop' | 'attr'
    name?: string
    formatter?: (text: string) => string
}

export type FieldProps = {
    selector: string
    selectorProps?: SelectorProps
}

export type SiOptions = {
    selector: string
    /** 单项数据的 key 选择器 */
    key: FieldProps
    extraInfo?: {
        [field: string]: FieldProps
    }
    // 分页相关设计
    page?: {
        /** 1. 选定页面 (适用于测试或只有单独一层数据时) */
        range?: [number, number]
        /** 2. 动态 */
        composeUrlFn: (target: string, pageNumber: number | string) => string
    }
    filter?: (text: string) => boolean
    /** 间隔时间 */
    interval?: number
    parallelLimit?: number
}

export type SiConfig = {
    target: SiTarget
    /** 列表元素选择器 */
    options: SiOptions
}

export type CollectRowListItem = {
    key: string
    extraInfo?: {
        [props: string]: string
    }
}

function checkSiConfig(config: SiConfig): boolean {
    const {
        target,
        options: { key },
    } = config

    if (!target || !key) {
        console.log(c.bgRed('config error: target/key can not be empty'))
        return false
    }

    return true
}

function getTargetList(target: SiTarget): string[] {
    if (typeof target === 'string') {
        return [target]
    }
    if (Array.isArray(target)) {
        return target
    }
    if (typeof target === 'function') {
        return target()
    }

    console.log('target error: ', target)
    return []
}

function getElementField(el: Cheerio, fieldProp: FieldProps) {
    const { selector, selectorProps } = fieldProp

    try {
        const fieldEl = el.find(selector)

        if (!selectorProps) {
            return fieldEl.text()
        } else {
            const { type, name, formatter } = selectorProps

            let fieldValue = ''

            if (!type || type === 'text') {
                fieldValue = fieldEl.text()
            } else {
                if (!name) {
                    console.log(c.red('when selectorProps.type != "text", name must be set'))
                } else {
                    fieldValue = name && fieldEl[type](name)
                }
            }

            return formatter ? formatter(fieldValue) : fieldValue
        }
    } catch (error) {
        console.log(c.red(`解析元素字段出错: ${error.toString()}`))
        return ''
    }
}

function getFieldsFromPageData(pageData: string, options: SiOptions) {
    const { selector, key, extraInfo, page } = options

    try {
        const $ = cheerio.load(pageData)

        const list = $(selector)

        return Array.from(list).map(item => {
            // 1. key
            const $Item = $(item)

            const keyValue = getElementField($Item, key)

            const keyEl = $Item.find(selector)

            const res: CollectRowListItem = {
                key: keyValue,
            }

            if (extraInfo) {
                res.extraInfo = {}

                Object.keys(extraInfo).forEach(key => {
                    const fieldValue = getElementField($Item, extraInfo[key])
                    res.extraInfo![key] = fieldValue
                })
            }

            return res
        })
    } catch (error) {
        console.log(c.red(`解析页面出错: ${error.toString()}`))
        return Promise.reject()
    }
}

async function getPageData(target: string): Promise<string> {
    try {
        const { status, request, data } = await axios.get(target)

        // todo retry

        if (status !== 200) {
            console.log(c.yellow(`页面请求错误 status: ${status}, request: ${request.toString()}`))
            return Promise.reject()
        }

        return data
    } catch (error) {
        console.log(c.red(error.toString()))
        return Promise.reject()
    }
}

async function mapTargets(targets: string[], options: SiOptions): Promise<CollectRowListItem[]> {
    const { interval = 1000, parallelLimit = 1 } = options

    return await new Promise((resolve, reject) => {
        Async.mapLimit(
            targets,
            parallelLimit,
            async (target, cb) => {
                try {
                    const pageData = await getPageData(target)

                    const result = getFieldsFromPageData(pageData, options)

                    await sleep(interval)

                    cb(null, result)
                } catch (error) {
                    await sleep(interval)

                    cb(null, {
                        key: target,
                        extraInfo: {
                            info: '解析页面出错',
                        },
                    })
                }
            },
            (error, data) => {
                if (error) {
                    reject(error)
                } else {
                    if (!data) {
                        resolve([])
                    }

                    const flatData = flatten(data) as CollectRowListItem[]

                    resolve(flatData)
                }
            }
        )
    })
}

// siphon
export async function si(config: SiConfig) {
    if (!checkSiConfig(config)) {
        return []
    }

    const { target, options } = config

    const targetList = getTargetList(target)

    const result = await mapTargets(targetList, options)

    return result
}
