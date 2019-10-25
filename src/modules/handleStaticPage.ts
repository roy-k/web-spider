import mapTaskFactory from "./mapTask"
import { repeatAsync } from "../util/util"
import { getPageData } from "./getPageData"
import { getFieldsFromPageData } from "./readPageData"

import { SiOptions, MapTask } from "types"

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

async function fetchAndReadPage(target: string, options: SiOptions) {
    const { retryTimes } = options

    // 1. 请求页面
    const pageData = await repeatAsync(() => getPageData(target), retryTimes)

    // 2. 解析数据
    return getFieldsFromPageData(pageData, options)
}

function resolvePage(options: SiOptions, mapTask: MapTask, onlyContent = false) {
    return async function taskHandler(target: string) {
        const { pagination, onEmitPageData } = options

        // 1. 请求 / 解读数据
        const result = await fetchAndReadPage(target, options)

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
            
            const taskList = new Array(restTaskLength).fill(1).map((i, index) => {
                return composeUrlFn(target!, index + 1)
            })

            // 添加至任务表
            // ! 避免重复的分页逻辑
            const onlyContentHandler = resolvePage(options, mapTask, true)
            return mapTask({
                taskList,
                taskHandler: onlyContentHandler,
                onEmitPageData,
            })
        } else if (nextPage) {
            // todo 都有什么类型的下一页
        }

        return result
    }
}

/**
 * 静态页面
 * @param targetList 目标url数组
 * @param options 抓取配置
 */
async function handleStaticPage(taskList: string[], options: SiOptions) {
    // 1. mapTask
    const { parallel, interval, onEmitPageData } = options
    const mapTask = mapTaskFactory(parallel, interval)
    // 2. handle 函数
    const taskHandler = resolvePage(options, mapTask)
    // 3. emitPageData
    return mapTask({
        taskList,
        taskHandler,
        onEmitPageData,
    })
}

export default handleStaticPage
