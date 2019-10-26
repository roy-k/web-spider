import c from 'ansi-colors'

/**
 * 模拟 sleep
 * @param millionSeconds 等待毫秒数
 */
export function sleep(millionSeconds: number) {
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, millionSeconds)
    })
}

type AsyncFn = () => Promise<any>
/**
 * 异步请求重试
 * @param fn promise 函数
 * @param times 重试次数
 */
export async function repeatAsync(fn: AsyncFn, times = 1) {
    if(times <= 0) {
        throw new Error(`bad times set: ${times}`);
    }
    if(times === 1) {
        return fn()
    }
    while (times > 0) {
        try {
            const res = await fn()
            return res
        } catch (error) {
            if(error && error === 'netError') {
                console.log('任务重试')
                times--
                continue
            } else {
                return Promise.reject(error)
            }
        }
    }
}

/**
 * 默认翻页地址
 * @param target 起始页面地址
 * @param page 页码
 */
// export function defaultComposeUrlFn(target: string, page: number | string) {
//     return `${target}/${page}`
// }
/**
 * 默认格式化页码/页数
 * @param page 页码/页数
 */

//  export const defaultFormatPageFn = parseInt


 // message
export function warn(msg:string) {
    console.log(c.yellow(msg))
}

export function error(msg:string) {
    console.log(c.red(msg))
}

export function info(msg:string) {
    console.log(msg)
}

