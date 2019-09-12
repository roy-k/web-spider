import { collectRowList, CollectRowListConfig } from "../rowList";

const rowListWithoutPage: CollectRowListConfig = {
    baseUrl: 'http://localhost:3098/home.html',
    selector: '.item-list',
    keySelector: '.post-box-title a',
}
test('collectRowList normal', async() => {
    const data = await collectRowList(rowListWithoutPage)

    expect(data.length).toBe(10)

    const first = data[0]

    const {key} = first

    expect(key).toMatch(/.+/)
})