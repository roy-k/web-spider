import { MapTaskConfig } from "types"
import { sleep, error, info, warn } from "../util/util"

/**
 *
 * @export mapTask 工厂函数
 * @param {number} [parallel=1] 并发数
 * @param {number} [interval=1000] 间隔
 * @returns {mapTask, addTask} 异步并发函数, 添加新任务
 */
export default function mapTaskFactory(parallel = 1, interval = 1000) {
    if (parallel < 1 || interval < 0) {
        error("bad params: parallel/interval")
        throw new Error("bad params: parallel/interval")
    }

    info(`taskQueue set: parallel(${parallel}), interval(${interval})`)

    /** 任务表 */
    let taskQueue: MapTaskConfig["taskList"] = []
    /** 返回值 */
    const result: any[] = []
    // 多次调用, 保持不变
    let isRunning = false
    // 剩余并发数
    let restThread = parallel
    // 回调只应该有一个
    let EmitPageData: MapTaskConfig["onEmitPageData"]

    /**
     * 执行器
     * 调用前 抢占线程(-1), 完成/失败 后 释放(+1)
     */
    async function runTask(): Promise<any> {
        if (!taskQueue.length) {
            // todo 新进来的任务 需要启动剩余数量的任务线
            restThread += 1
            return null
        }
        const currentTask = taskQueue.splice(0, 1)[0]

        try {
            const pageData = await currentTask()

            if (EmitPageData) {
                EmitPageData(null, pageData)
            } else {
                result.push(pageData)
            }
        } catch (error) {
            EmitPageData && EmitPageData(error, null)
            // todo error 处理
            console.log(error)
            result.push(error)
        } finally {
            await sleep(interval)
            // 这里查询剩余线程, 并启动相应数量的任务
            restThread += 1
            console.log("restThread", restThread)

            return startTask(restThread)
        }
    }

    /** 执行传入数量的任务 */
    function startTask(number: number) {
        if (!number) {
            return Promise.resolve()
        }
        if (number === 1) {
            restThread -= 1
            return runTask()
        }

        const tasks = Array(number)
            .fill(1)
            .map(() => {
                restThread -= 1
                return runTask()
            })

        return Promise.all(tasks)
    }

    /** 多次调用时, 后续调用将直接返回*/
    async function mapTask({ taskList, onEmitPageData }: MapTaskConfig) {
        taskQueue = [...taskQueue, ...taskList]

        if (isRunning) {
            warn("no need to run mapTask again, use addTask instead")
            return []
        }

        isRunning = true

        EmitPageData = onEmitPageData

        // 这里完成即所有任务完成才返回
        await startTask(parallel)

        return result
    }

    /**
     * 添加新任务
     * @param taskList 任务表
     */
    function addTask(taskList: MapTaskConfig["taskList"]) {
        if (!isRunning) {
            error(`'mapTask' must run before 'addTask'`)
            throw "mapTask must run before addTask"
        }

        taskQueue = [...taskQueue, ...taskList]
    }

    return {
        mapTask,
        addTask,
    }
}
