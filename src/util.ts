export function sleep(millionSeconds: number) {
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, millionSeconds)
    })
}
