import { asyncParallel, mapTask } from "../../src/modules/taskControl"
import { MapTaskConfig } from "../../types"

let times = 2
async function testRepeatAsync(value: any) {
    return value
}

async function testRepeatAsyncError() {
    throw "other error"
}

test("mapTask normal", async () => {
    let mockFn = jest.fn()

    const config: MapTaskConfig = {
        taskList: [1, 2, 3, 4],
        taskHandler: testRepeatAsync,
        parallel: 2,
        callback: mockFn,
    }

    const res = await mapTask(config)
    expect(mockFn).toBeCalledTimes(2)
    expect(res.length).toBe(0)
})

test("mapTask result Array", async () => {
    const config: MapTaskConfig = {
        taskList: [1, 2, 3, 4],
        taskHandler: testRepeatAsync,
        parallel: 2,
    }

    const res = await mapTask(config)
    console.log('res', res)

    expect(res.length).toBe(2)
    expect(res[0] && res[0].length).toBe(2)
})
