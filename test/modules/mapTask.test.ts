import mapTaskFactory from "../../src/modules/mapTask"

const tasks = ["a", "b", "c", "d", "e", "f"]

describe("mapTask module", () => {
    // 测试几个点
    // 1. 正常 并发 与 耗时
    // 2. 多次调用
    // 3. 异常
    test("mapTask and collect result", async () => {
        const { mapTask } = mapTaskFactory(3, 1000)

        let mockFn = jest.fn().mockResolvedValue("mock")
        const taskList = tasks.map(v => () => mockFn(v))

        const result = await mapTask({
            taskList,
        })

        expect(mockFn).toBeCalledTimes(6)
        expect(result.length).toBe(6)
    })

    test("mapTask and callback", async () => {
        const { mapTask } = mapTaskFactory(4, 1000)

        let mockFn = jest.fn().mockResolvedValue("mock")
        let mockEmit = jest.fn()

        const taskList = tasks.map(v => () => mockFn(v))

        const result = await mapTask({
            taskList,
            onEmitPageData: mockEmit,
        })

        expect(mockFn).toBeCalledTimes(6)
        expect(mockEmit).toBeCalledTimes(6)
        expect(result.length).toBe(0)
    })

    test("mapTask and collect result, with addTask", async () => {
        const { mapTask, addTask } = mapTaskFactory(5, 1000)

        let mockFn = jest.fn().mockResolvedValue("mock")
        let mockEmit = jest.fn()

        const taskList = tasks.map(v => () => mockFn(v))

        const firstMap = mapTask({
            taskList,
            onEmitPageData: mockEmit,
        })

        addTask(taskList)

        return firstMap.then(result => {
            expect(mockFn).toBeCalledTimes(12)
            expect(mockEmit).toBeCalledTimes(12)
            expect(result.length).toBe(0)
        })
    })

    test("mapTask and callback, with addTask", async () => {
        const { mapTask, addTask } = mapTaskFactory(5, 1000)

        let mockFn = jest.fn().mockResolvedValue("mock")

        const taskList = tasks.map(v => () => mockFn(v))

        const firstMap = mapTask({
            taskList,
        })

        addTask(taskList)

        return firstMap.then(result => {
            expect(mockFn).toBeCalledTimes(12)
            expect(result.length).toBe(12)
        })
    })

    test("mapTaskFactory bad params", async () => {
        expect(() => mapTaskFactory(0, 1000)).toThrowError("bad params: parallel/interval")
    })

    test("can not addTask before mapTask", async () => {
        const { mapTask, addTask } = mapTaskFactory(5, 1000)
        expect(() => addTask([])).toThrowError("mapTask must run before addTask")
    })

    test("mapTask and callback, with mapTask again", async () => {
        const { mapTask, addTask } = mapTaskFactory(5, 1000)

        let mockFn = jest.fn().mockResolvedValue("mock")

        const taskList = tasks.map(v => () => mockFn(v))

        const firstMap = mapTask({
            taskList,
        })

        const res = await mapTask({taskList})

        expect(res.length).toBe(0)

        return firstMap.then(result => {
            expect(mockFn).toBeCalledTimes(12)
            expect(result.length).toBe(12)
        })
    })
})
