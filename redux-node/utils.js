/**
 * 执行函数超时
 * @param {*} fn
 * @param {*} interval
 */
export function* setFuncTimeout(fn, interval, ...args) {
  try {
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
