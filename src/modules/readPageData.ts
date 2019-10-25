import cheerio from 'cheerio'
import {info, error, warn} from '../util/util'

import { FieldProps, SiOptions, CollectRowListItem, PageData } from '../../types'

export function getFieldsFromPageData(pageData: string, options: SiOptions): PageData {
    const { selector, key, extraInfo, pagination } = options

    try {
        const $ = cheerio.load(pageData)

        const list = $(selector)

        const pageDataResult: any = {}

        // 目标元素列表
        pageDataResult.list = Array.from(list).map(item => {
            // 1. key
            const $Item = $(item)

            const keyValue = getElementField($Item, key)

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

        // 分页信息
        if (pagination) {
            pageDataResult.pagination = {}
            const { totalPage, nextPage } = pagination
            if (totalPage) {
                const fieldValue = getElementField(list, totalPage, $)
                pageDataResult.pagination!['totalPage'] = fieldValue
            }
            if (nextPage) {
                const fieldValue = getElementField(list, nextPage, $)
                pageDataResult.pagination!['nextPage'] = fieldValue
            }
        }
        return pageDataResult as PageData
    } catch (err) {
        error(`解析页面出错: ${err.toString()}`)
        return { list: [] }
    }
}

export function getElementField(el: Cheerio, fieldProp: FieldProps, $?: CheerioStatic) {
    const { selector, selectorProps } = fieldProp

    try {
        const fieldEl = $ ? $(selector) : el.find(selector)

        if (!selectorProps) {
            return fieldEl.text()
        } else {
            const { type, name, formatter } = selectorProps

            let fieldValue = ''

            if (!type || type === 'text') {
                fieldValue = fieldEl.text()
            } else {
                if (!name) {
                    error('when selectorProps.type != "text", name must be set')
                } else {
                    fieldValue = name && fieldEl[type](name)
                }
            }

            return formatter ? formatter(fieldValue) : fieldValue
        }
    } catch (err) {
        error(`解析元素字段出错: ${err.toString()}`)
        return ''
    }
}

// export default getFieldsFromPageData
