/**  */
import { timeout } from "../saga";
import sagaTester from "../sagaTester";
describe("timeout", () => {
  test("正常执行 不会超时", (done) => {
    let fn = function* (value) {
      return 1;
    };

    sagaTester(
      (error, result) => {
        expect(error).toBeInstanceOf(Error);
        expect(result).toBe(1);
        done();
      },
      timeout,
      // timeout
      fn,

      500
    );
  });

  test("当执行时间超过预设的超时时间时，会触发超时错误", (done) => {
    let fn = function* (value) {
      return 1;
    };

    sagaTester(
      (error, result) => {
        expect(error).toBeInstanceOf(Error);
        expect(result).toBe(1);
        done();
      },
      timeout,
      // timeout
      fn,

      500
    );
    done();
  });

  test("执行函数出错误时，会抛出错误", (done) => {
    done();
  });
});
