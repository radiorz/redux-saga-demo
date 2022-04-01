import { eventChannel, runSaga } from "redux-saga";

function* rootSaga(callback, fn, ...args) {
  try {
    let r = yield call(fn, ...args);
    // 为测试预留接口的回调
    callback(null, r);
  } catch (error) {
    callback(error);
  }
}
/**
 * 提供 执行 生成器的测试环境的函数
 * @param {*} callback 测试用的callback例子用来处理函数执行正确与错误结果 
 * @param {*} fn 需要测试的 生成器函数
 * @param  {...any} args 传入fn 的参数
 */
const startTester = ({callback,eventbus} = {}, fn, ...args) => {
  runSaga(
    {
      dispatch: (action) => {
        // 通过参数让外部的 eventbus 得以接受最终可以测试每一项emit的数据
        eventbus.emit(action);
      },
      getState: () => {
        return {};
      },
    },
    rootSaga,
    // 后面是 rootSaga 的一切参数
    callback,
    fn,
    ...args
  );
};

export default startTester;
