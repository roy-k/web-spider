import { MapTaskConfig } from "types"
import { sleep } from "../util/util"

/**
 * 异步并发
 * @param config MapTaskConfig
 */
export async function asyncParallel(config: MapTaskConfig) {
    const { taskList, taskHandler } = config

    const tasks = taskList.map(value => taskHandler(value))
    return Promise.all(tasks)
}

/**
 * 执行控制
 * @param config MapTaskConfig
 */
export async function mapTask(config: MapTaskConfig) {
    const { callback, parallel = 1, interval = 1000, ...rest } = config
    let { taskList } = config

    const result = []
    console.log(`task start: length(${taskList.length}), parallel(${parallel}), interval(${interval})`);
    
    while (taskList.length) {
        const currentTaskList = taskList.slice(0, parallel)

        try {
            const res = await asyncParallel({
                ...rest,
                taskList: currentTaskList,
            })

            if (callback) {
                callback(null, res)
            } else {
                result.push(res)
            }
        } catch (error) {
            callback && callback(error, null)
            console.log(error)
        } finally {
            await sleep(interval)
            taskList = taskList.slice(parallel)
        }
    }

    return result
}
