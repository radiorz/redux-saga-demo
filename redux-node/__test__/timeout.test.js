/**  */
import { timeout as setFuncTimeout } from "../utils";
import { select, put, take, call, delay, fork, race } from "redux-saga/effects";
import sagaTester from "../sagaTester";
describe("timeout", () => {
  jest.setTimeout(1000 * 60);
  test("正常执行 不会超时", (done) => {
    let fn = function* () {
      console.log(123)
      return 1;
    };
    sagaTester(
      {
        callback: (error, result) => {
          expect(error).toBe(null);
          expect(result).toBe(1);
          done();
        },
      },
      setFuncTimeout,
      fn,
      1
    );
  });

  test("当执行时间超过预设的超时时间时，应触发超时错误", (done) => {
    let fn = function* (value) {
      yield delay(1000);
      return 1;
    };

    sagaTester(
      {
        callback: (error, result) => {
          expect(error).toBeInstanceOf(Error);
          done();
        },
      },
      setFuncTimeout,
      // timeout
      fn,

      500
    );
  });

  test("执行函数出错误时，会抛出错误", (done) => {
    // 抛错的函数
    let fn = function* () {
      throw new Error("error");
    };
    sagaTester(
      {
        callback: (error, result) => {
          expect(error).toBeInstanceOf(Error);
          done();
        },
      },
      setFuncTimeout,
      fn,
      500
    );
  });
});
