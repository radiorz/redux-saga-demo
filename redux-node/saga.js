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
  cancelled,
} from "redux-saga/effects";
import { timeout as setFuncTimeout } from "./utils";
export const ACTIONS = {
  download: "DOWNLOAD_TASK",
  downloadSuccess: "DOWNLOAD_SUCCESS",
  downloadFail: "DOWNLOAD_FAIL",
  stopDownload: "SHOULD_STOP",
  retry: "RETRY",
  downloadBegin: "DOWNLOAD_BEGIN",
  downloadEnd: "DOWNLOAD_END",
  cancelDownload: "CANCEL_DOWNLOAD",
};
export const MESSAGES = {
  ...ACTIONS,
  downloadStart: "DOWNLOAD_START",
  downloading: "DOWNLOADING",
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

export function* retrySyncTimeout(fn, options = {}, ...args) {
  let lastError = null;
  const {
    retryCount = 2,
    retryInterval = 1000,
    timeout = 1000,
    onSuccess = () => {},
    onError = () => {},
    onLastError = () => {},
    onCancel = () => {},
  } = options;
  for (let i = 0; i < retryCount; i++) {
    try {
      // 是否超时
      const result = yield call(setFuncTimeout, fn, timeout, ...args);
      // 发送成功消息
      yield onSuccess({ result });
      return result;
    } catch (error) {
      lastError = error;
      yield onError({ error });
    } finally {
      // 判断是否被cancel 善后比如清除资源
      if (yield cancelled()) onCancel();
    }
    if (i === retryCount - 1) {
      yield onLastError({ lastError });
      throw new Error(MESSAGES.downloadFail);
    }
    yield delay(retryInterval);
  }
}

/**
 * 获取任务中止 action
 */
function* waitForDownloadStop() {
  return yield take([
    ACTIONS.downloadSuccess,
    ACTIONS.downloadFail,
    ACTIONS.cancelDownload,
  ]);
}

function* onDownloadError({ id, ...rest }) {
  yield put({ type: ACTIONS.downloadError, payload: { id, ...rest } });
}

function* onDownloadSuccess({ id, ...rest }) {
  yield put({ type: ACTIONS.downloadSuccess, payload: { id, ...rest } });
}
function* onDownloadLastError({ id, ...rest }) {
  yield put({ type: ACTIONS.downloadFail, payload: { id, ...rest } });
}
function* onDownloadTaskCancelled({ id }) {
  yield put({
    type: ACTIONS.downloadFail,
    payload: { id, error: "be cancelled" },
  });
}
/**
 * 每个下载任务
 * 具有 完整的生命周期
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
    const downloadTask = yield fork(
      retrySyncTimeout,
      httpDownload,
      {
        ...options,
        onError: (options) => onDownloadError({ id: taskId, ...options }),
        onSuccess: (options) => onDownloadSuccess({ id: taskId, ...options }),
        onLastError: (options) =>
          onDownloadLastError({ id: taskId, ...options }),
        onCancel: () => onDownloadTaskCancelled({ id: taskId }),
      },
      url
    );
    // 监听 reset 下载任务
    let action = yield waitForDownloadStop();
    // 监听取消指令
    if (action.type === ACTIONS.cancelDownload) {
      cancel(downloadTask);
    }
    // take 收到结束任务信号 自治
    if (action === ACTIONS.downloadSuccess) {
      // 更新状态
    }
    if (action === ACTIONS.downloadFail) {
      // 更新状态
    }
    // TODO 上级任务被结束
    // 全部停止全部开始... 每个 任务
  } catch (error) {
    if (error.message === ACTIONS.retry) {
    }
    yield put({
      type: ACTIONS.downloadFail,
      payload: { url, error: lastError },
    });
  }
}

/**
 * 下载任务循环模块
 * 功能: 强制取消
 * 错误处理 状态更新 恢复 持久化...暂停..
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
        // TODO 停止下载每个任务的
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
