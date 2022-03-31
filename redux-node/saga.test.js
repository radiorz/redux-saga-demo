import rootSaga, { downloadManager, startDownloadTask } from "./saga";
import { select, put, call, take, fork, race, delay } from "redux-saga/effects";
beforeAll(() => {
  jest.setTimeout(1000 * 60 * 60);
});
// 环境松耦合
// describe("test rootSaga", () => {
//   const state = {
//     a: 1,
//     b: 2,
//   };
// FIXME
//   test("wait to select store", () => {
//     const gen = rootSaga();
//     return expect(gen.next().value).toEqual(select((state) => state));
//   });

// });

describe("test downloadManager", () => {
  const state = {
    a: 1,
    b: 2,
  };
  const ACTIONS = {
    download: "DOWNLOAD",
  };
  const gen = downloadManager();
  test("wait to take action", (done) => {
    expect(gen.next().value).toEqual(take(ACTIONS.download));
    done();
  });
  test("the action is download,go to download", () => {
    const action = {
      type: ACTIONS.download,
      payload: {
        url: "http://www.baidu.com",
      },
    };
    expect(gen.next(action).value).toEqual(
      fork(startDownloadTask, action.payload.url, {})
    );
  });
});
