import mapTaskFactory from '../../src/modules/mapTask'

const tasks = ['a', 'b', 'c', 'd']

test('mapTask', async () => {
    const mapTask = mapTaskFactory(2, 1000)

    let mockFn = jest.fn().mockResolvedValue('mock')

    await mapTask({
        taskList: tasks,
        taskHandler: mockFn,
    })

    expect(mockFn).toBeCalledTimes(4)
})
