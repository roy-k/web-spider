import { MapTaskConfig } from "types"
import { sleep, error, info, warn } from "../util/util"
import { Browser, Page } from "puppeteer"

async function initPagePool(browser: Browser, pagesNumber = 1) {
    return Promise.all(
        Array(Math.floor(pagesNumber))
            .fill(1)
            .map(async () => browser.newPage())
    )
}
/**
 *
 * @export mapTask 工厂函数
 * @param {number} [parallel=1] 并发数
 * @param {number} [interval=1000] 间隔
 * @returns {mapTask, addTask} 异步并发函数, 添加新任务
 */
export default async function mapTaskFactory(browser: Browser, parallel = 1, interval = 1000) {
    if (parallel < 1 || interval < 0) {
        error("bad params: parallel/interval")
        throw new Error("bad params: parallel/interval")
    }

    info(`taskQueue set: parallel(${parallel}), interval(${interval})`)

    /** 标签页池 */
    const pagePool: Page[] = await initPagePool(browser, parallel)

    /** 任务表 */
    let taskQueue: MapTaskConfig["taskList"] = []
    /** 返回值 */
    const result: any[] = []
    // 多次调用, 保持不变
    let isRunning = false
    // 回调只应该有一个
    let EmitPageData: MapTaskConfig["onEmitPageData"]

    /**
     * 执行器
     */
    async function runTask(): Promise<any> {
        // 自取 page
        if (!taskQueue.length || !pagePool.length) {
            return null
        }

        const currentTask = taskQueue.splice(0, 1)[0]
        const page = pagePool.shift()

        try {
            const pageData = await currentTask(page)

            if (EmitPageData) {
                EmitPageData(null, pageData)
            } else {
                result.push(pageData)
            }
        } catch (error) {
            EmitPageData && EmitPageData(error, null)
            result.push(error)
        } finally {
            await sleep(interval)
            // 这里查询剩余线程, 并启动相应数量的任务
            pagePool.push(page!)
            return startTask()
        }
    }

    /** 执行传入数量的任务 */
    function startTask() {
        if (!taskQueue.length || !pagePool.length) {
            return Promise.resolve()
        }

        const tasks = Array(Math.min(taskQueue.length, pagePool.length))
            .fill(1)
            .map(() => {
                return runTask()
            })

        return Promise.all(tasks)
    }

    /** 多次调用时, 后续调用将直接返回*/
    async function mapDynamicTask({ taskList, onEmitPageData }: MapTaskConfig) {
        taskQueue = [...taskQueue, ...taskList]

        if (isRunning) {
            warn("no need to run mapTask again, use addTask instead")
            return []
        }

        isRunning = true

        EmitPageData = onEmitPageData

        // 这里完成即所有任务完成才返回
        await startTask()

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
        mapDynamicTask,
        addTask,
    }
}
