/**
 * 执行函数超时
 * @param {*} fn
 * @param {*} interval
 */
export function* setFuncTimeout(fn, interval=0, ...args) {
  try {
    // 不需要超时
    if(interval === 0){
      return call(fn,...args)
    }
    let { isTimeout, result } = yield race({
      result: call(fn, ...args),
      isTimeout: delay(interval),
    });
    if (isTimeout) {
      throw new Error("TIMEOUT");
    }
    return result;
    // yield call(httpDownload, url);
  } catch (err) {
    throw err;
  }
}
