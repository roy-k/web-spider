import { MapTaskConfig } from "types"
import { sleep } from "../util/util"

/**
 *
 *
 * @export mapTask 工厂函数
 * @param {number} [parallel=1] 并发数
 * @param {number} [interval=1000] 间隔
 * @returns mapTask 异步并发函数
 */
export default function mapTaskFactory(parallel = 1, interval = 1000) {
    console.log(`taskQueue set: parallel(${parallel}), interval(${interval})`)
    /** 任务表 */
    let taskQueue: MapTaskConfig["taskList"] = []
    /** 返回值 */
    const result: any[] = []
    // 多次调用, 保持不变
    let isRunning = false
    
    /** 执行器 */
    async function runTask(
        taskHandler: MapTaskConfig["taskHandler"],
        onEmitPageData: MapTaskConfig["onEmitPageData"]
    ): Promise<null> {
        if (!taskQueue.length) {
            return null
        }
        const currentTask = taskQueue.splice(0, 1)

        try {
            const pageData = await taskHandler(currentTask)

            if (onEmitPageData) {
                onEmitPageData(null, pageData)
            } else {
                result.push(pageData)
            }
        } catch (error) {
            onEmitPageData && onEmitPageData(error, null)
            console.log(error)
        } finally {
            await sleep(interval)

            return runTask(taskHandler, onEmitPageData)
        }
    }

    /** 多次调用时, 后续调用将直接返回*/
    return async function mapTask({ taskList, taskHandler, onEmitPageData }: MapTaskConfig) {
        taskQueue = [...taskQueue, ...taskList]

        if (isRunning) {
            return []
        }

        isRunning = true

        const tasks = Array(parallel)
            .fill(1)
            .map(() => runTask(taskHandler, onEmitPageData))

        await Promise.all(tasks)

        return result
    }
}
