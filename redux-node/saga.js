import { eventChannel, runSaga } from "redux-saga";
import { select, put, call, take, fork, race, delay } from "redux-saga/effects";
import eventemitter from "eventemitter2";
// 事件总线
const eventbus = new eventemitter();
// 倒计时
// 事件连接器

function countdown(secs) {
  return eventChannel((emitter) => {
    // 采用 eventbus 接受
    eventbus.onAny((action) => {
      emitter(action);
    });
    let i = 0;
    // 定时发送
    setInterval(() => {
      eventbus.emit({
        type: ACTIONS.download,
        payload: { url: `http://www.baidu.com/file${i++}` },
      });
    }, 1000);
    return () => {
      eventbus.offAny();
    };
  });
}
// 共享存储
let state = {
  a: 1,
  b: 2,
};
const ACTIONS = {
  download: "DOWNLOAD",
};
function* httpDownload(url) {
  yield delay(3000);
}

export function* startDownloadTask(
  url,
  { retryCount = 2, retryInterval = 1000, timeout = 1000 }
) {
  for (let i = 0; i < retryCount; i++) {
    try {
      let { isTimeout, result } = yield race({
        result: call(httpDownload, url),
        isTimeout: delay(timeout),
      });
      if (isTimeout) {
        throw new Error("TIMEOUT");
      }
      return result;
      // yield call(httpDownload, url);
      break;
    } catch (err) {
      console.log(`retry ${url} ${i} ${err.message}`);
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
runSaga(
  {
    //
    channel: countdown(10),
    dispactch: (action) => {
      eventemitter: emit(action);
    },
    getState: () => {
      return state;
    },
  },
  rootSaga
);
