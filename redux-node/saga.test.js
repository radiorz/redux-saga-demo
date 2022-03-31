import rootSaga, { downloadManager } from "./saga";
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

describe("test downloadManager",()=>{
  const state = {
    a: 1,
    b: 2,
  };
  const ACTIONS = {
    download: "DOWNLOAD",
  }
  test("wait to take action", () => {
    const gen = downloadManager();
    return expect(gen.next().value).toEqual(take(ACTIONS.download));
  });

})
