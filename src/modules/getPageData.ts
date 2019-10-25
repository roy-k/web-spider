import axios from 'axios'
import { warn, error } from '../util/util'


export async function getPageData(target: string): Promise<string> {
    try {
        const { status, request, data } = await axios.get(target)

        if (status !== 200) {
            warn(`getPageData error; status: ${status}, request: ${request.toString()}`)
            return Promise.reject('netError')
        }

        return data
    } catch (err) {
        error(err)
        return Promise.reject()
    }
}
