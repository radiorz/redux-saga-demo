import rootSaga, { downloadManager, startDownloadTask } from "./saga";
import { cloneableGenerator } from "@redux-saga/testing-utils";
import { select, put, call, take, fork, race, delay } from "redux-saga/effects";
// FIXME 执行完毕 报错：  Cannot log after tests are done. Did you forget to wait for something async in your test?
beforeAll(() => {
  jest.setTimeout(1000 * 60 * 60);
});
// 环境松耦合
describe("test rootSaga", () => {
  const state = {
    a: 1,
    b: 2,
  };
  // FIXME 开始会获取 state
  test("wait to select store", () => {
    const gen = rootSaga();
    return expect(gen.next().value).toEqual(select((state) => state));
  });
});

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

describe("startDownloadTask", () => {
  test("should yield race", () => {});
});
