import { repeatAsync } from "../../src/util/util"

let times = 2
async function testRepeatAsync() {
    if (times > 0) {
        times--
        return Promise.reject("netError")
    }
    return Promise.resolve("ok")
}

async function testRepeatAsyncError() {
    throw "other error"
}

test("repeatAsync normal", async () => {
    const res = await repeatAsync(testRepeatAsync, 3)
    expect(times).toBe(0)
    expect(res).toBe("ok")
})

test("repeatAsync error", async () => {
    try {
        const res = await repeatAsync(testRepeatAsyncError, 3)
    } catch (error) {
        expect(error).toBe("other error")
    }
})

test("repeatAsync error 1", async () => {
    try {
        const res = await repeatAsync(testRepeatAsyncError, 1)
    } catch (error) {
        expect(error).toBe("other error")
    }
})
