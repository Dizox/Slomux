import React from 'react';
import PropTypes from 'prop-types';
import logo from './logo.svg';
import './App.css';

// Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.

// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.

// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

const createStore = (reducer, initialState) => {
  let currentState = initialState
  const listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => listeners.push(listener)

  return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) =>
  Component => {
    class WrappedComponent extends React.Component {
      render() {
        return (
          <Component
            {...this.props}
            {...mapStateToProps(this.context.store.getState(), this.props)}
            {...mapDispatchToProps(this.context.store.dispatch, this.props)}
          />
        )
      }

      componentDidMount() {
        this.context.store.subscribe(this.handleChange)
      }

      handleChange = () => {
        this.forceUpdate()
      }
    }

    WrappedComponent.contextTypes = {
      store: PropTypes.object,
    }

    return WrappedComponent
  }

class Provider extends React.Component {
  getChildContext() {
    return {
      store: this.props.store,
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

Provider.childContextTypes = {
  store: PropTypes.object,
}

// APP

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL'
const SET_TIMER = 'SET_TIMER'

// action creators
const changeInterval = value => ({
  type: CHANGE_INTERVAL,
  payload: value,
})

const setTimer = timer => ({
  type: SET_TIMER,
  payload: timer,
})

// reducers
const reducer = (state, action) => {
  switch (action.type) {
    case CHANGE_INTERVAL:
      return {
        ...state,
        currentInterval: state.currentInterval + action.payload
      };
    case SET_TIMER:
      return {
        ...state,
        timer: action.payload
      };
    default:
      return state;
  }
}

// components

class IntervalComponent extends React.Component {
  render() {
    return (
      <div>
        <span>Интервал обновления секундомера: {this.props.currentInterval} сек.</span>
        <span>
          <button
            onClick={() => this.props.changeInterval(-1)}
            disabled={this.props.timer || this.props.currentInterval <= 1}
          >
            -
          </button>
          <button
            onClick={() => this.props.changeInterval(1)}
            disabled={this.props.timer}
          >
            +
          </button>
        </span>
      </div>
    )
  }
}

const Interval = connect(
  state => ({
    currentInterval: state.currentInterval,
    timer: state.timer,
  }),
  dispatch => ({ changeInterval: value => dispatch(changeInterval(value)) })
)(IntervalComponent)

class TimerComponent extends React.Component {
  state = {
    currentTime: 0,
  }

  render() {
    return (
      <div>
        <Interval />
        <div>
          Секундомер: {this.state.currentTime} сек.
        </div>
        <div>
          <button onClick={this.handleStart} disabled={this.props.timer}>Старт</button>
          <button onClick={this.handleStop}>Стоп</button>
        </div>
      </div>
    )
  }

  handleStart = () => {
    const timer = setInterval(() => {
      this.setState({
        currentTime: this.state.currentTime + this.props.currentInterval,
      });
    }, this.props.currentInterval * 1000)
    this.props.setTimer(timer);
  }

  handleStop = () => {
    clearInterval(this.props.timer);
    this.setState({ currentTime: 0 });
    this.props.setTimer(null);
  }
}

// initial state

const initialState = {
  currentInterval: 1,
  timer: null
};

const Timer = connect(state => ({
  currentInterval: state.currentInterval,
  timer: state.timer,
}), (dispatch) => ({
  setTimer: timer => dispatch(setTimer(timer))
}))(TimerComponent)

function App() {
  return (
    <Provider store={createStore(reducer, initialState)}>
      <Timer />
    </Provider>
  );
}

export default App;
