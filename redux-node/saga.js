import {
  select,
  put,
  call,
  take,
  fork,
  race,
  delay,
  cancel,
} from "redux-saga/effects";

export const ACTIONS = {
  download: "DOWNLOAD",
  downloadSuccess: "DOWNLOAD_SUCCESS",
  downloadFail: "DOWNLOAD_FAIL",
  stopDownload: "SHOULD_STOP",
  retry: "RETRY",
};
export function* httpDownload(url) {
  yield delay(3000);
  return { url };
}

export function* retrySyncTimeout(fn, options, ...args) {
  const { retryCount = 2, retryInterval = 1000, timeout = 1000 } = options;
  for (let i = 0; i < retryCount; i++) {
    try {
      let { isTimeout, result } = yield race({
        result: call(fn, args),
        isTimeout: delay(timeout),
      });
      if (isTimeout) {
        throw new Error("TIMEOUT");
      }
      return result;
      // yield call(httpDownload, url);
    } catch (err) {
      yield put({
        type: ACTIONS.retry,
        payload: {
          ...args,
          error: err,
          retryTimes: i,
        },
      });
    } finally {
      console.log(`i`, i);
      console.log(`retryCount`, retryCount);
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
export function* startDownloadTask(
  url,
  options = { retryCount: 2, retryInterval: 1000, timeout: 1000 }
) {
  try {
    const result = yield call(
      retrySyncTimeout,
      httpDownload,
      {
        ...options,
      },
      url
    );
    yield put({ type: ACTIONS.downloadSuccess, payload: result });
  } catch (error) {
    yield put({
      type: ACTIONS.downloadFail,
      payload: `${url} ${error.message}`,
    });
  }
}

export function* downloadManager() {
  console.log("Download start");
  while (true) {
    let action = yield take(ACTIONS.download); // 阻塞
    if (action.type === ACTIONS.download) {
      // yield call(startDownloadTask, action.payload.url);  // 阻塞
      // 漏掉
      const downloadTask = yield fork(
        startDownloadTask,
        action.payload.url,
        {}
      ); // 非阻塞
      // TODO 停止下载
      //  let stopAction = yield take(ACTIONS.stopDownload)
      //  if (stopAction.type === ACTIONS.stopDownload) {
      //     yield cancel(downloadTask)
      //     yield put({ type: ACTIONS.downloadFail, payload: `${action.payload.url} is stop` });
      //   }
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
