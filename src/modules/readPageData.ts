import cheerio from 'cheerio'
import { info, error, warn } from '../util/util'

import { FieldProps, SiOptions, CollectRowListItem, PageData } from '../../types'

export function getFieldsFromPageData(pageData: string, options: SiOptions): PageData {
    const { selector, fields, pagination } = options

    try {
        const $ = cheerio.load(pageData)

        const list = $(selector)

        const pageDataResult: any = {}

        // 目标元素列表
        pageDataResult.list = Array.from(list).map(item => {
            const $Item = $(item)

            const res: CollectRowListItem = {}

            Object.entries(fields).forEach(([key, fieldProp]) => {
                const fieldValue = getElementField($Item, fieldProp)
                res[key] = fieldValue
            })

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
