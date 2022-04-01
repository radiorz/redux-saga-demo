import { eventChannel, runSaga } from "redux-saga";

function* rootSaga(fn, ...args) {
  try {
    yield call(fn, ...args);
  } catch (error) {}
}

const startTester = (fn, ...args) => {
  runSaga(
    {
      dispatch: (action) => {},
      getState: () => {
        return {};
      },
    },
    rootSaga,
    
    fn,
    ...args
  );
};

export default startTester;
