import { SiConfig, SiTarget } from "../types";

import { error } from "./util/util";
import handleStaticPage from "./modules/handleStaticPage";
import handelDynamicPage from "./modules/handelDynamicPage";

/**
 * 检查配置
 * @param config SiConfig
 */
function checkSiConfig(config: SiConfig): boolean {
  if (config.target) {
    error("config error: target/key can not be empty");
    return false;
  }

  return true;
}

/**
 * 获取目标页面列表
 * @param target SiTarget
 */
function getTargetList(target: SiTarget): string[] {
  if (typeof target === "string") {
    return [target];
  }
  if (Array.isArray(target)) {
    return target;
  }
  if (typeof target === "function") {
    return target();
  }

  console.log("target error: ", target);
  return [];
}

/**
 * si
 * @param config SiConfig
 * @param config.target 页面地址
 * @param config.options 抓取配置
 */
export async function si(config: SiConfig) {
  if (!checkSiConfig(config)) {
    return [];
  }

  const { target, mode = "static", options } = config;

  const targetList = getTargetList(target);
  if (!targetList.length) {
    return;
  }

  if (mode === "static") {
    // * 静态页面
    return handleStaticPage(targetList, options);
  }

  if (mode === "dynamic") {
    // todo 动态页面
    return handelDynamicPage(targetList, options);
  }
}

export default si;
