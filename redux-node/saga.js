import { select, put, call, take, fork, race, delay } from "redux-saga/effects";

export const ACTIONS = {
  download: "DOWNLOAD",
  downloadSuccess: "DOWNLOAD_SUCCESS",
  downloadFail: "DOWNLOAD_FAIL",
};
export function* httpDownload(url) {
  yield delay(3000);
  return { url };
}

export function* retrySyncTimeout(
  fn,
  { retryCount = 2, retryInterval = 1000, timeout = 1000 }
) {
  for (let i = 0; i < retryCount; i++) {
    try {
      let { isTimeout, result } = yield race({
        result: call(fn),
        isTimeout: delay(timeout),
      });
      if (isTimeout) {
        throw new Error("TIMEOUT");
      }
      return result;
      // yield call(httpDownload, url);
    } catch (err) {
      console.log(`retry ${i} ${err.message}`);
    } finally {
      console.log(i);
      console.log(retryCount);
      if (i === retryCount - 1) {
        throw new Error("download fail");
      }
      yield delay(retryInterval);
    }
  }
}
/**
 *
 */
export function* startDownloadTask(url, options) {
  try {
    const result = yield call(
      retrySyncTimeout,
      () => httpDownload(url),
      options
    );
    yield put({ type: ACTIONS.downloadSuccess, payload: result });
  } catch (error) {
    yield put({ type: ACTIONS.downloadFail, payload: error.message });
  }
}

export function* downloadManager() {
  console.log("Download start ");
  while (true) {
    let action = yield take(ACTIONS.download); // 阻塞
    if (action.type === ACTIONS.download) {
      // yield call(startDownloadTask, action.payload.url);  // 阻塞
      // 漏掉
      yield fork(startDownloadTask, action.payload.url, {}); // 非阻塞
    }
    // 大量 阻塞 /fork(类似多线程)的的任务发生 实践 是否会让非阻塞 漏掉部分消息(悖论)
    // yield call()

    // node 是单线程的 所以不会出现漏掉的情况
    // 执行 异步函数 又会丢失???
    // yield delay(5000);
  }
}

// 入口 执行环境
export default function* rootSaga() {
  console.log("rootSaga");
  let state = yield select((state) => state);
  console.log(`state`, state);
  yield call(downloadManager); // 堵塞方法
  console.log();
}
