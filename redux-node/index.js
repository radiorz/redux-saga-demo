import eventemitter from "eventemitter2";
import { eventChannel, runSaga } from "redux-saga";
import rootSaga, { ACTIONS } from "./saga";
// 事件总线
const eventbus = new eventemitter();
// 倒计时
// 事件连接器
export function countdown(secs) {
  return eventChannel((emitter) => {
    // 采用 eventbus 接受
    eventbus.onAny((action) => {
      console.log(`action`,action)
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
};
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
  rootSaga
);
