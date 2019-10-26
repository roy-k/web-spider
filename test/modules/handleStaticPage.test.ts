import handleStaticPage from "../../src/modules/handleStaticPage"
import { getPageData } from "../../src/modules/getPageData"
import { getFieldsFromPageData } from "../../src/modules/readPageData"

jest.mock('../../src/modules/getPageData')

const targetList = ['a', 'b']
test('handleStaticPage', () => {
    // handleStaticPage(targetList, {
    //     key: ''
    // })
})
