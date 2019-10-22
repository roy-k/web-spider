import c from 'ansi-colors'
import flatten from 'lodash/flatten'
import { repeatAsync } from './util/util'

import { SiConfig, SiTarget, MapTaskConfig, FieldProps, SiOptions, CollectRowListItem } from '../types'
import { getPageData } from './modules/getPageData'
import { getFieldsFromPageData } from './modules/readPageData'
import { mapTask } from './modules/taskControl'

/**
 * 检查配置
 * @param config SiConfig
 */
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

/**
 * 获取目标页面列表
 * @param target SiTarget
 */
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

function defaultComposeUrlFn(target: string, page: number | string) {
    return `${target}/${page}`
}

async function fetchAndReadPage(target: string, options: SiOptions) {
    const { taskOption, pagination } = options

    const retryTimes = taskOption && taskOption.retryTimes
    // 1. 请求页面
    const pageData = await repeatAsync(() => getPageData(target), retryTimes)

    // 2. 解析数据
    return getFieldsFromPageData(pageData, options)
}

function resolvePage(options: SiOptions, mode = 'static') {
    // 逻辑设计
    // 1. 任务表
    return async (target: string) => {
        const { pagination, ...restOptions } = options

        // 2. 请求 / 解读数据
        const result = await fetchAndReadPage(target, options)

        if (!result || !pagination) {
            return result
        }

        // 3. 处理分页
        const formatFieldsValue = pagination.formatFieldsValue || parseInt
        const composeUrlFn = pagination.composeUrlFn || defaultComposeUrlFn

        const pageDataPagination = result.pagination
        if (!pageDataPagination) {
            console.error(`分页数据获取失败: ${target}`)
            return result
        }

        // 3.1 多页 total
        let taskList: string[] = []
        const { totalPage, nextPage } = pageDataPagination

        if (totalPage) {
            const restTaskLength = formatFieldsValue(totalPage) - 1
            if (restTaskLength > 0) {
                return result
            }
            taskList = new Array(restTaskLength).fill(1).map((i, index) => {
                return composeUrlFn(target!, index + 1)
            })
            while (taskList.length) {
                const currentTarget = taskList.shift()
                const currentPageResult = await fetchAndReadPage(currentTarget!, restOptions) // 精简了options
                if (!currentPageResult) {
                    continue
                }
                result.list = [...result.list, ...currentPageResult.list]
            }
        } else if (nextPage) {
            // todo 都有什么类型的下一页
            // target
            // js + 1
        }

        return result
    }
}

/**
 * si
 * @param config SiConfig
 * @param config.target 页面地址
 * @param config.options 抓取配置
 */
export async function si(config: SiConfig) {
    if (!checkSiConfig(config)) {
        return []
    }

    const { target, options } = config

    const { taskOption } = options

    const taskList = getTargetList(target)
    if (!taskList.length) {
        return
    }

    const retryTimes = taskOption && taskOption.retryTimes

    // 页面处理逻辑
    // 多页面
    // mode

    // const taskHandler = async (target: string) => {
    //     const pageData = await repeatAsync(() => getPageData(target), retryTimes)

    //     const result = getFieldsFromPageData(pageData, options)

    //     return result
    // }
    const taskHandler = resolvePage(options)

    const taskConfig: MapTaskConfig = {
        taskList,
        taskHandler,
        parallel: taskOption && taskOption.parallelLimit,
        interval: taskOption && taskOption.interval,
    }

    const result = await mapTask(taskConfig)

    return flatten(result)
}

export default si