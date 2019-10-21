import c from 'ansi-colors'
import Async from 'async'
import { flatten } from 'lodash'
import { sleep } from './util/util'

import { SiConfig, SiTarget, FieldProps, SiOptions, CollectRowListItem } from '../types'
import {getPageData} from './modules/getPageData'
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

// siphon
export async function si(config: SiConfig) {
    if (!checkSiConfig(config)) {
        return []
    }

    const { target, options } = config

    const {taskOption = {}} = options

    const targetList = getTargetList(target)

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
