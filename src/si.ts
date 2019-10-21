import c from "ansi-colors"
import flatten from "lodash/flatten"
import { repeatAsync } from "./util/util"

import { SiConfig, SiTarget, MapTaskConfig, FieldProps, SiOptions, CollectRowListItem } from "../types"
import { getPageData } from "./modules/getPageData"
import { getFieldsFromPageData } from "./modules/readPageData"
import { mapTask } from "./modules/taskControl"

function checkSiConfig(config: SiConfig): boolean {
    const {
        target,
        options: { key },
    } = config

    if (!target || !key) {
        console.log(c.bgRed("config error: target/key can not be empty"))
        return false
    }

    return true
}

function getTargetList(target: SiTarget): string[] {
    if (typeof target === "string") {
        return [target]
    }
    if (Array.isArray(target)) {
        return target
    }
    if (typeof target === "function") {
        return target()
    }

    console.log("target error: ", target)
    return []
}

/**
 * si
 * @param config SiConfig
 * @param config.target 页面地址
 * @param config.options 抓取配置
 */
export default async function si(config: SiConfig) {
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

    const taskHandler = async (target: string) => {
        const pageData = await repeatAsync(() => getPageData(target), retryTimes)

        const result = getFieldsFromPageData(pageData, options)

        return result
    }

    const taskConfig: MapTaskConfig = {
        taskList,
        taskHandler,
        parallel: taskOption && taskOption.parallelLimit,
        interval: taskOption && taskOption.interval,
    }

    const result = await mapTask(taskConfig)

    return flatten(result)
}
