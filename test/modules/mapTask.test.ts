import { TaskOption } from '../../types'
import {mapTask} from '../../src/modules/mapTask'

const tasks = ['a', 'b']
const option: TaskOption = {
    interval: 1000,
    retryTimes: 2,
    parallelLimit: 1,
}
test('mapTask', async () => {
    let mockFn = jest.fn().mockResolvedValue('mock')

    const data = await mapTask(tasks, mockFn, option)

    expect(mockFn).toBeCalledTimes(2)
    expect(data.length).toBe(2)
})
