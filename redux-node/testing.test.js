import { select, put, call, take, fork, race, delay } from "redux-saga/effects";

const CHOOSE_COLOR = "改变颜色";
const CHANGE_UI = "改变 UI";

const chooseColor = (color) => ({
  type: CHOOSE_COLOR,
  payload: {
    color,
  },
});
const changeUI = (color) => ({
  type: CHANGE_UI,
  payload: {
    color,
  },
});

function* changeColorSaga() {
  const action = yield take(CHOOSE_COLOR);
  yield put(changeUI(action.payload.color));
}

describe("test changeColorSaga", () => {
  const gen = changeColorSaga();
  test("it should wait for a user to choose a color", () => {
    // 希望下一个返回点是正在取颜色
    expect(gen.next().value).toEqual(take(CHOOSE_COLOR));
  });
  test('it should dispatch an action to change the ui',()=>{
     const color = "red";
     // 假定take 的结果返回选择了红色,将会触发 changeUI action
     expect(gen.next(chooseColor(color)).value).toEqual(put(changeUI(color)));

  })
  test("it should be done", () => {
    expect(gen.next().done).toBe(true);
  });
});
