import eventemitter from "eventemitter2";
import { eventChannel, runSaga } from "redux-saga";
import { downloadManager, ACTIONS, MESSAGES } from "./saga";
// 事件总线
const eventbus = new eventemitter();
// 倒计时
// 事件连接器
export function countdown(secs) {
  return eventChannel((emitter) => {
    // 采用 eventbus 接受
    eventbus.onAny((action) => {
      // 处理 各种返回信息
      if (action.type === ACTIONS.downloadBegin) {
        state.tasks[action.payload.id] = action.payload;
        state.tasks[action.payload.id].status = MESSAGES.downloadBegin;
      } else if (action.type === ACTIONS.downloadProgress) {
        state.tasks[action.payload.id] = action.payload;
        state.tasks[action.payload.id].status = MESSAGES.downloading;
      } else if (action.type === ACTIONS.downlaodEnd) {
        state.tasks[action.payload.id] = action.payload;
        state.tasks[action.payload.id].status = MESSAGES.downloadEnd;
      } else if (action.type === ACTIONS.downloadFail) {
      }
      console.log(`action`, action);
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
export let state = {
  a: 1,
  b: 2,
  // 保存下载任务
  tasks: [
    /* { url, payload,progress,status } */
  ],
};

export function* rootSaga(fn, ...args) {
  try {
    yield fn(...args);
  } catch (error) {}
}
const sagaTester = (fn, ...args) => {
  runSaga(
    {
      //
      channel: countdown(10),
      dispatch: (action) => {
        eventbus.emit(action);
      },
      getState: () => {
        return state;
      },
    },
    rootSaga,
    downloadManager,
    ...args
  );
};

export default sagaTester;
sagaTester(rootSaga);
