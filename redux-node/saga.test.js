import rootSaga, { downloadManager, startDownloadTask, ACTIONS } from "./saga";
import eventemitter from "eventemitter2";
import { eventChannel, runSaga } from "redux-saga";
import { cloneableGenerator } from "@redux-saga/testing-utils";
import { select, put, call, take, fork, race, delay } from "redux-saga/effects";
// FIXME 执行完毕 报错：  Cannot log after tests are done. Did you forget to wait for something async in your test?
beforeAll(() => {
  jest.setTimeout(1000 * 60 * 60);
});

describe("test the full startDownloadTask", () => {
  jest.setTimeout(1000 * 20);
  test("startDownloadTask", async () => {
    let url = "http://www.baidu.com/file0";
    let dispatches = [];
    await runSaga(
      {
        dispatch: (action) => {
          dispatches.push(action);
        },
        getState: () => ({
          state: "test",
        }),
      },
      startDownloadTask,
      url,
      { retryCount: 3, timeout: 1000 }
    ).toPromise();
    console.log;
    expect(dispatches.length).toBe(4);
    expect(dispatches[0].type).toEqual(ACTIONS.retry);
    expect(dispatches[1].type).toEqual(ACTIONS.retry);
    expect(dispatches[2].type).toEqual(ACTIONS.retry);
    expect(dispatches[3].type).toEqual(ACTIONS.downloadFail);
  });
});

// 模拟测试整个 downloadManager
describe("test the full downloadManager", () => {
  // FIXME 这个 test 执行不完
  // jest.setTimeout(1000 * 20);
  test("eventbus 触发一次下载，测试是否 put 消息", async () => {
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
        // 发送一次请求 应该返回失败
        let i = 0;
        eventbus.emit({
          type: ACTIONS.download,
          payload: { url: `http://www.baidu.com/file${i++}` },
        });
        return () => {
          eventbus.offAny();
        };
      });
    }
    const dispatches = [];
    // FIXME 这里 downloadManager 会无限循环 如何结束
    await runSaga(
      {
        channel: countdown(10),
        dispatch: (action) => {
          dispatches.push(action);
        },
        getState: () => ({ state: "test" }),
      },
      downloadManager
    ).toPromise();

    // 触发 downloadMangaer
    expect(dispatches.length).toBe(4);
    expect(dispatches[0].type).toEqual(ACTIONS.downloadFail);
  });
});

describe("test the full retrySyncTimeout",()=>{
  // TODO 未完待续
});

/** 以下为一步一步运行 */
describe("test downloadManager", () => {
  const state = {
    a: 1,
    b: 2,
  };
  const ACTIONS = {
    download: "DOWNLOAD",
  };
  // const gen = downloadManager();
  const gen = cloneableGenerator(downloadManager)();
  test("wait to take action", (done) => {
    expect(gen.next().value).toEqual(take(ACTIONS.download));
    done();
  });

  test("the action is download,go to download", () => {
    const clone = gen.clone();
    const action = {
      type: ACTIONS.download,
      payload: {
        url: "http://www.baidu.com",
      },
    };
    expect(clone.next(action).value).toEqual(
      fork(startDownloadTask, action.payload.url, {})
    );
  });
  test("the action is not download, just 重新 take 监听action", () => {
    const clone = gen.clone();
    const action = {
      type: "NOT_DOWNLOAD",
      payload: {
        url: "http://www.baidu.com",
      },
    };
    expect(clone.next(action).value).toEqual(take(ACTIONS.download));
  });
});

/**  */
