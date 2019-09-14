import c from 'ansi-colors'
import Async from 'async'
import { flatten } from 'lodash'
import { sleep } from 'src/util'

import { SiConfig, SiTarget, FieldProps, SiOptions, CollectRowListItem } from './types'
import getPageData from './modules/getPageData'
import { getFieldsFromPageData } from './modules/readPageData'
import { mapTask } from './modules/mapTask'

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

// async function mapTargets(targets: string[], options: SiOptions): Promise<CollectRowListItem[]> {
//     const { interval = 1000, parallelLimit = 1, retryTimes } = options

//     return await new Promise((resolve, reject) => {
//         Async.mapLimit(
//             targets,
//             parallelLimit,
//             async (target, cb) => {
//                 try {
//                     const pageData = await getPageData(target, retryTimes)

//                     const result = getFieldsFromPageData(pageData, options)

//                     await sleep(interval)

//                     cb(null, result)
//                 } catch (error) {
//                     await sleep(interval)

//                     cb(null, {
//                         key: target,
//                         extraInfo: {
//                             info: '解析页面出错',
//                         },
//                     })
//                 }
//             },
//             (error, data) => {
//                 if (error) {
//                     reject(error)
//                 } else {
//                     if (!data) {
//                         resolve([])
//                     }

//                     const flatData = flatten(data) as CollectRowListItem[]

//                     resolve(flatData)
//                 }
//             }
//         )
//     })
// }

// task handle todo

// siphon

export async function si(config: SiConfig) {
    if (!checkSiConfig(config)) {
        return []
    }

    const { target, options } = config

    const {taskOption = {}} = options

    const targetList = getTargetList(target)

    // const result = await mapTargets(targetList, options)
    const result = await mapTask(
        targetList,
        async (target, retryTimes) => {
            const pageData = await getPageData(target, retryTimes)

            const result = getFieldsFromPageData(pageData, options)

            return result
        },
        taskOption
    )

    return result
}
