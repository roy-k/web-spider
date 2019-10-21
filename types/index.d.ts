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
    /** 目标dom选择器 */
    selector: string
    /** 单项数据的 key 选择器 */
    key: FieldProps
    /** 附加字段信息 */
    extraInfo?: {
        [field: string]: FieldProps
    }
    /** 分页相关设计 */ 
    page?: {
        /** 1. 选定页面 (适用于测试或只有单独一层数据时) */
        range?: [number, number]
        /** 2. 动态 */
        composeUrlFn: (target: string, pageNumber: number | string) => string
    }
    /** 过滤器 */
    filter?: (item: CollectRowListItem) => boolean
    /** 间隔时间 */
    taskOption?: TaskOption
    /** 页面类型 static / dynamic */
    mode?: 'static' | 'dynamic'
}
/**  */
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

export type MapTaskConfig = {
    /**`任务列表 */
    taskList: any[]
    /** 执行句柄 */
    taskHandler: (params: any) => any
    /** 单个任务回调 */
    callback?: (error: any, data: any) => void
    /** 并发数 */
    parallel?: number
    /** 重试次数 */
    retryTimes?: number
    /** 任务间隔 */
    interval?: number
}