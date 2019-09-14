import c from 'ansi-colors'
import cheerio from 'cheerio'

import { FieldProps, SiOptions, CollectRowListItem } from 'src/types'

export function getFieldsFromPageData(pageData: string, options: SiOptions) {
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

export function getElementField(el: Cheerio, fieldProp: FieldProps) {
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

export default getFieldsFromPageData