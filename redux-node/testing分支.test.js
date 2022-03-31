const CHOOSE_NUMBER = "选择奇偶数";
const DO_STUFF = "做点什么";

const chooseNumber = (number) => ({
  type: CHOOSE_NUMBER,
  payload: {
    number,
  },
});
const changeUI = (color) => ({
  type: CHANGE_UI,
  payload: {
    color,
  },
});
const doStuff = () => ({
  type: DO_STUFF,
});
function* doStuffThenChangeColor() {
  yield put(doStuff());
  yield put(doStuff());
  const action = yield take(CHOOSE_NUMBER);
  if (action.payload.number % 2 === 0) {
    yield put(changeUI("red"));
  } else {
    yield put(changeUI("blue"));
  }
}

describe("test doStuffThenChangeColor", () => {
  const gen = cloneableGenerator(doStuffThenChangeColor)();
  gen.next(); // DO_STUFF
  gen.next(); // DO_STUFF
  gen.next(); // CHOOSE_NUMBER
  it("doStuffThenChangeColor", () => {
    // cloning the generator before sending data
    const clone = gen.clone();
  });
});
