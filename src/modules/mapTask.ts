import Async from 'async'
import { TaskOption, CollectRowListItem } from '../../types'
import { sleep } from '../util/util'
import flatten from 'lodash/flatten'

export async function mapTask(
    targets: string[],
    getData: (target: string, retryTimes?: number) => Promise<CollectRowListItem[]>,
    options: TaskOption
): Promise<CollectRowListItem[]> {
    const { interval = 1000, parallelLimit = 1, retryTimes, flattenList = true } = options

    return await new Promise((resolve, reject) => {
        Async.mapLimit(
            targets,
            parallelLimit,
            async (target, cb) => {
                try {
                    const result = await getData(target, retryTimes)

                    await sleep(interval)

                    cb(null, result)
                } catch (error) {
                    cb(null, {
                        key: target,
                        extraInfo: {
                            info: '解析页面出错',
                        },
                    })
                }
            },
            (error, data) => {
                if (error) {
                    reject(error)
                } else {
                    if (!data) {
                        resolve([])
                    }

                    const flatData = flatten(data) as CollectRowListItem[]

                    resolve(flatData)
                }
            }
        )
    })
}
