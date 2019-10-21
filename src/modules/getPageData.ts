import c from 'ansi-colors'
import axios from 'axios'


export async function getPageData(target: string): Promise<string> {
    try {
        const { status, request, data } = await axios.get(target)

        if (status !== 200) {
            console.log(c.yellow(`getPageData error; status: ${status}, request: ${request.toString()}`))
            return Promise.reject('netError')
        }

        return data
    } catch (error) {
        console.log(c.red(error.toString()))
        return Promise.reject()
    }
}
