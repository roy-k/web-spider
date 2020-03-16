# spider-node

    简单爬虫模块, 通过配置来组装一个爬虫

## RoadMap

**静态站点**

- [x] 列表项信息抓取
- [x] 附加字段信息抓取
- [x] 分页循环执行, 间隔
- [x] 并发


**动态站点**

- [x] 列表项信息抓取
- [x] 附加字段信息抓取
- [x] 分页循环执行, 间隔
- [x] 并发
- [ ] 多种属性支持

## docs

**module**

```ts
import si from 'siphon-web'
```

**configs**
```ts
export type SiConfig = {
    /** 页面地址 */
    target: SiTarget
    /** 页面类型 static / dynamic */
    mode?: 'static' | 'dynamic'
    /** 抓取配置 */
    options: SiOptions
}

export type SiTarget = string | string[] | TargetGenerator

export type SiOptions = {
    /** 目标dom选择器 */
    selector: string
    /** 单项数据的 key 选择器 */
    // key: FieldProps 移动到 fields中
    onEmitPageData?: (error: any, pageData: any) => void
    /** 附加字段信息 */
    fields?: {
        [field: string]: FieldProps
    }
    /** 分页相关设计 */

    pagination?: {
        /** dom选择 */
        totalPage?: FieldProps
        /** 连续翻页 */
        nextPage?: FieldProps
        formatFieldsValue?: (value: string) => number
        /** 分页地址组合 */
        composeUrlFn?: (target: string, page: number | string) => string
    }
    /** 过滤器 */
    filter?: (item: CollectRowListItem) => boolean
    /** 间隔时间 */
    interval?: number
    /** 并发数 */
    parallel?: number
    /** 重试次数 */
    retryTimes?: number
}
```

**returns**

1. with callback
2. no

**example**

```ts
// see test/si.test.ts
```

**2019-3-16**

    - 增加动态站点支持
    - 更新配置字段