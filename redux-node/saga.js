import { nanoid } from "nanoid";
import {
  select,
  put,
  call,
  take,
  fork,
  race,
  delay,
  cancel,
  takeLatest,
} from "redux-saga/effects";
import { setFuncTimeout } from "./utils";
export const ACTIONS = {
  download: "DOWNLOAD_TASK",
  downloadSuccess: "DOWNLOAD_SUCCESS",
  downloadFail: "DOWNLOAD_FAIL",
  stopDownload: "SHOULD_STOP",
  retry: "RETRY",
  downloadBegin: "DOWNLOAD_BEGIN",
  downloadEnd: "DOWNLOAD_END",
};
export const MESSAGES = {
  ...ACTIONS,
  downloadStart: "DOWNLOAD_START",
  downloading:"DOWNLOADING",
  timeout: "TIMEOUT",
  downloadFail: "DOWNLOAD_FAIL",
};
function* getFile() {
  yield delay(1000);
}
/**
 * 模拟下载
 * @param {*} url
 * @returns
 */
export function* httpDownload(url) {
  // 模拟进度汇报
  for (let i = 0; i < 10; i++) {
    // 模拟下载延迟
    const aRandomTime = parseInt(Math.random() * 100);
    yield delay(aRandomTime);
    // 触发进度汇报
    yield put({
      type: ACTIONS.downloadProgress,
      payload: {
        url,
        progress: (i / 9) * 100,
      },
    });
  }
  return { url };
}

export function* retrySyncTimeout(fn, options, ...args) {
  const { retryCount = 2, retryInterval = 1000, timeout = 1000 } = options;
  for (let i = 0; i < retryCount; i++) {
    try {
      // 是否超时
      yield call(setFuncTimeout, fn, timeout, ...args);
    } catch (error) {
      yield put({ type: ACTIONS.retry });
      // throw error;
    } finally {
      if (i === retryCount - 1) {
        throw new Error(MESSAGES.downloadFail);
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
    // 下载id
    let taskId = nanoid();
    // 开始下载信号
    yield put({ type: ACTIONS.downloadBegin, payload: { url, id: taskId } });
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
    if (error.message === ACTIONS.retry)
      yield put({
        type: ACTIONS.downloadFail,
        payload: `${url} ${error.message}`,
      });
  }
}

/**
 * 下载任务循环模块
 */
export function* downloadManager() {
  console.log(`downloadManager is running`);
  while (true) {
    // 编写下载任务
    let action = yield take(ACTIONS.download); // 阻塞
    if (action.type === ACTIONS.download) {
      let downloadTask;
      try {
        downloadTask = yield fork(startDownloadTask, action.payload.url, {}); // 非阻塞
        // TODO 停止下载
        let stopAction = yield take(ACTIONS.stopDownload);
        if (stopAction.type === ACTIONS.stopDownload) {
          yield cancel(downloadTask);
          yield put({
            type: ACTIONS.downloadFail,
            payload: `${action.payload.url} is stop`,
          });
        }
      } catch (error) {
      } finally {
        // TODO 结束后做点什么
        // if (takeLatest.cancelled()) {
        //   console.log("cancelled");
        // }
      }
    }
  }
}

// 入口 执行环境
export default function* rootSaga() {
  console.log("rootSaga start");
  let state = yield select((state) => state);
  console.log(`state`, state);
  yield call(downloadManager); // 堵塞方法
  console.log(`rootSaga end`);
}
