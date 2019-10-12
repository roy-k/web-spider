export type TargetGenerator = () => string[]

export type SiTarget = string | string[] | TargetGenerator

export type SelectorProps = {
    type?: 'text' | 'prop' | 'attr'
    name?: string
    formatter?: (text: string) => string
}

export type FieldProps = {
    selector: string
    selectorProps?: SelectorProps
}

export type TaskOption = {
    interval?: number
    parallelLimit?: number
    retryTimes?: number
    /** 是否合并多页条目 */
    flattenList?: boolean
}

export type SiOptions = {
    selector: string
    /** 单项数据的 key 选择器 */
    key: FieldProps
    extraInfo?: {
        [field: string]: FieldProps
    }
    // 分页相关设计
    page?: {
        /** 1. 选定页面 (适用于测试或只有单独一层数据时) */
        range?: [number, number]
        /** 2. 动态 */
        composeUrlFn: (target: string, pageNumber: number | string) => string
    }
    filter?: (item: CollectRowListItem) => boolean
    /** 间隔时间 */
    taskOption?: TaskOption
}

export type SiConfig = {
    target: SiTarget
    /** 列表元素选择器 */
    options: SiOptions
}

export type CollectRowListItem = {
    key: string
    extraInfo?: {
        [props: string]: string
    }
}
