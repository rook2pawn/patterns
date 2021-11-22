const Nanocomponent = require("nanocomponent");
const html = require("choo/html");
const css = require("sheetify");
const nanostate = require("nanostate");

css("./component.css");

class Component extends Nanocomponent {
  constructor() {
    super();
    this._loadedResolve;
    this.loaded = new Promise((resolve, reject) => {
      this._loadedResolve = resolve;
    });
    this.date = new Date();
  }

  getYearMonthDate() {
    return {
      year: this.date.getFullYear(),
      month: this.date.getMonth(),
      date: this.date.getDate(),
    };
  }

  getLastDayOfMonth({ year, month }) {
    // https://stackoverflow.com/questions/315760/what-is-the-best-way-to-determine-the-number-of-days-in-a-month-with-javascript
    // use month = 1 for jan, etc.. Because we are using the 0 to specify the last day of the previous month.
    return new Date(year, month, 0).getDate();
  }

  createElement({ state, emit }) {
    // base : https://codepen.io/TutulDevs/pen/oNbEgYx
    // from: https://freefrontend.com/css-calendars/
    this.date = new Date();
    this.date.setMonth(state.date.month);
    this.date.setFullYear(state.date.year);
    this.date.setDate(state.date.date);
    // identify all events for the month and create dateHash
    const monthEvents = state.list.filter(({ date }) => {
      const { year, month } = date;
      return year === state.date.year && month === state.date.month;
    });
    const dateHash = new Map();
    monthEvents.forEach(({ date, todo, isCompleted }) => {
      if (dateHash.get(date.date) === undefined) {
        dateHash.set(date.date, []);
      }
      let hashList = dateHash.get(date.date);
      hashList.push({ date, todo, isCompleted });
      dateHash.set(date.date, hashList);
    });

    // handle identifying prev days to show, last day of the month, and active day
    const dayLong = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(this.date);
    const monthLong = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(this.date);
    const lastDayOfPrevMonth = this.getLastDayOfMonth({
      year: this.date.getFullYear(),
      month: this.date.getMonth(),
    });
    const lastDayOfCurrentMonth = this.getLastDayOfMonth({
      year: this.date.getFullYear(),
      month: this.date.getMonth() + 1,
    });
    const firstDayMonth = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      1
    );
    const firstDayOfTheMonth = firstDayMonth.getDay();
    // we show (lastDayOfPrevMonth-(firstDayOfTheMonth-1)), ... lastDayOfPrevMonth as "prev"
    // i.e. if Dec 2021 lastDayOfPrevMonth = 31 and firstDayOfTheMonth = 3.
    // 29,30,31,1,2,3,4...
    const prevDays = [];
    const start = lastDayOfPrevMonth - (firstDayOfTheMonth - 1);
    for (let i = start; i <= lastDayOfPrevMonth; i++) {
      prevDays.push(i);
    }
    const currDays = [];
    for (let i = 1; i <= lastDayOfCurrentMonth; i++) {
      currDays.push(i);
    }

    return html`<div class="calendarMobile">
      <section class="navContainer">
        <div
          onclick=${() => {
            emit("calendar:navPrevMonth");
          }}
          class="nav prev"
        ></div>
        <span
          onclick=${() => {
            emit("calendar:navToday");
          }}
          class="nav"
        >
          Jump to today
        </span>
        <div
          onclick=${() => {
            emit("calendar:navNextMonth");
          }}
          class="nav next"
        ></div>
      </section>
      <section class="container">
        <ul class="days">
          <li>sun</li>
          <li>mon</li>
          <li>tue</li>
          <li>wed</li>
          <li>thu</li>
          <li>fri</li>
          <li>sat</li>
        </ul>
        <ul class="dates">
          ${prevDays.map((day) => html`<li class="prev">${day}</li>`)}
          ${currDays.map((day) => {
            let hashList = dateHash.get(day);
            const isActive = day === state.date.date;
            if (hashList !== undefined) {
              return html`<li
                onclick=${() => {
                  emit("calendar:dayClick", {
                    year: state.date.year,
                    month: state.date.month,
                    date: day,
                  });
                }}
                class="circle orange ${isActive ? "active" : ""}"
              >
                ${day} <span>${hashList.length}</span>
              </li>`;
            }
            if (isActive) {
              return html`<li
                onclick=${() => {
                  emit("calendar:dayClick", {
                    year: state.date.year,
                    month: state.date.month,
                    date: day,
                  });
                }}
                class="active"
              >
                ${day}
              </li>`;
            }
            return html`<li
              onclick=${() => {
                emit("calendar:dayClick", {
                  year: state.date.year,
                  month: state.date.month,
                  date: day,
                });
              }}
            >
              ${day}
            </li>`;
          })}
        </ul>
      </section>
    </div>`;
  }

  load(el) {
    this.el = el;
    this._loadedResolve();
  }

  update() {
    return true;
  }
}

module.exports = exports = Component;
