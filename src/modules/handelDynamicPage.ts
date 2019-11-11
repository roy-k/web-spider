import mapDynamicTaskFactory from "./mapDynamicTask"
import { repeatAsync } from "../util/util"
import { getPageData } from "./getPageData"
import { getFieldsFromPageData } from "./readPageData"
import puppeteer, { Page, ElementHandle } from "puppeteer"

import { SiOptions, AddTask, PageData, FieldProps, CollectRowListItem } from "types"

/**
 * 默认翻页地址
 * @param target 起始页面地址
 * @param page 页码
 */
function defaultComposeUrlFn(target: string, page: number | string) {
    return `${target}/${page}`
}
/**
 * 默认格式化页码/页数
 * @param page 页码/页数
 */
function defaultFormatPageFn(page: string) {
    return parseInt(page)
}

async function fetchAndReadPage(page: Page, target: string, options: SiOptions): Promise<any> {
    const { retryTimes, selector, key, extraInfo, pagination } = options

    // todo 重试等?
    await page.goto(target, { waitUntil: "networkidle2" })

    // 2. 解析数据
    // todo 要传入更多东西
    const list = await page.$$eval(
        selector,
        (elements, { key, extraInfo }) => {
            // 这里要处理完

            function getElementField(context: any, fieldProps: FieldProps) {
                try {
                    const { selector, selectorProps } = fieldProps

                    const el = context.querySelector(selector)

                    if (!selectorProps) {
                        return el.innerText
                    }

                    const { type, name, formatter } = selectorProps

                    switch (name) {
                        case "href":
                            return el.href
                            break
                        case "text":
                            return el.innerText
                            break
                        case "href":
                            return el.href
                            break

                        default:
                            return ""
                            break
                    }
                } catch (error) {
                    return null
                }
            }
            return elements.map(el => {
                const keyValue = getElementField(el, key)

                const res: CollectRowListItem = {
                    key: keyValue,
                }

                if (extraInfo) {
                    res.extraInfo = {}

                    Object.keys(extraInfo).forEach(key => {
                        const fieldValue = getElementField(el, extraInfo[key])
                        res.extraInfo![key] = fieldValue
                    })
                }

                return res
            })
        },
        { key, extraInfo }
    )

    return { list }
}

function resolvePage(options: SiOptions, addTask: AddTask, onlyContent = false) {
    return async function taskHandler(page: Page, target: string) {
        const { pagination, onEmitPageData } = options

        // 1. 请求 / 解读数据
        const result = await fetchAndReadPage(page, target, options)

        if (!result || onlyContent || !pagination) {
            return result
        }

        // 3. 处理分页
        const formatFieldsValue = pagination.formatFieldsValue || defaultFormatPageFn
        const composeUrlFn = pagination.composeUrlFn || defaultComposeUrlFn

        const pageDataPagination = result.pagination
        if (!pageDataPagination) {
            console.warn(`分页数据获取失败: ${target}`)
            // todo 这种错误怎么处理
            return result
        }

        const { totalPage, nextPage } = pageDataPagination

        // 3.1 多页 total
        if (totalPage) {
            const restTaskLength = formatFieldsValue(totalPage) - 1
            if (restTaskLength > 0) {
                return result
            }

            // 添加至任务表
            // ! 避免重复的分页逻辑
            const onlyContentHandler = resolvePage(options, addTask, true)

            const taskList = new Array(restTaskLength).fill(1).map((i, index) => {
                const targetUrl = composeUrlFn(target!, index + 1)
                return (page: Page) => onlyContentHandler(page, targetUrl)
            })

            addTask(taskList)
        } else if (nextPage) {
            // todo 都有什么类型的下一页
        }

        return result
    }
}

async function handleDynamicPage(targetList: string[], options: SiOptions) {
    // * launch
    const browser = await puppeteer.launch({
        // headless: false,
        // timeout: 60000
        // devtools: true,
    })

    // 1. mapTask
    const { parallel, interval, onEmitPageData } = options
    const { mapDynamicTask, addTask } = await mapDynamicTaskFactory(browser, parallel, interval)
    // 2. handle 函数
    const taskHandler = resolvePage(options, addTask)
    const taskList = targetList.map(target => (page: Page) => taskHandler(page, target))

    // 3. emitPageData
    return mapDynamicTask({
        taskList,
        onEmitPageData,
    })
}

export default handleDynamicPage
