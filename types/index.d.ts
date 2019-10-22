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
}

/** 抓取配置 */
export type SiOptions = {
    /** 目标dom选择器 */
    selector: string
    /** 单项数据的 key 选择器 */
    key: FieldProps
    /** 附加字段信息 */
    extraInfo?: {
        [field: string]: FieldProps
    }
    /** 分页相关设计 */

    pagination?: {
        /** dom选择 */
        totalPage?: FieldProps
        /** 连续翻页 */
        nextPage?: FieldProps
        formatFieldsValue?: (value: string) => number
        /**  选定页面 (适用于测试或只有单独一层数据时) */
        // range?: [number, number]
        /** 分页地址组合 */
        composeUrlFn?: (target: string, page: number | string) => string
    }
    /** 过滤器 */
    filter?: (item: CollectRowListItem) => boolean
    /** 间隔时间 */
    taskOption?: TaskOption
    /** 页面类型 static / dynamic */
    mode?: 'static' | 'dynamic'
}
/** 爬虫配置 */
export type SiConfig = {
    /** 页面地址 */
    target: SiTarget
    /** 抓取配置 */
    options: SiOptions
}

export type CollectRowListItem = {
    key: string
    extraInfo?: {
        [props: string]: string
    }

}

export type PageData = {
    list: CollectRowListItem[]
    pagination?: {
        totalPage?: string
        nextPage?: string
    }
}

export type MapTaskConfig = {
    /**`任务列表 */
    taskList: any[]
    /** 执行句柄 */
    taskHandler: (params: any) => any
    /** 单个任务回调 */
    callback?: (error: any, data: any) => void
    /** 并发数 */
    parallel?: number
    /** 任务间隔 */
    interval?: number
}