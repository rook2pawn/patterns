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
    this.items = Array(36)
      .fill()
      .map((_, i) => ({
        isFlipped: false,
        num: i + 1,
        value: ~~(Math.random() * 4),
      }));
  }

  flip({ idx }) {
    this.items[idx].isFlipped = !this.items[idx].isFlipped;
    const keyframes = [
      {
        transform: "rotateY(0deg)",
      },
      {
        transform: "rotateY(180deg)",
      },
    ];
    const options = {
      duration: 1000,
      iterations: 1,
      easing: "ease-in-out",
    };
    const anim = document
      .getElementById(`card_${idx}`)
      .animate(keyframes, options);
    anim.finished.then(() => {
      this.rerender();
    });
  }
  flipAll() {
    this.items = this.items.map(({ num, value, isFlipped }) => {
      return { num, value, isFlipped: !isFlipped };
    });
    const keyframes = [
      {
        transform: "rotateY(0deg)",
      },
      {
        transform: "rotateY(180deg)",
      },
    ];
    const options = {
      duration: 200,
      iterations: 1,
      easing: "ease-in-out",
      fill: "forwards",
    };

    this.items
      .reduce((prev, { num }) => {
        return prev.then(() => {
          const element = document.getElementById(`card_${num}`);
          const anim = element.animate(keyframes, options);
          return anim.finished;
        });
      }, Promise.resolve())
      .then(() => {
        this.rerender();
      });
  }
  createElement({ state, emit }) {
    // https://stackoverflow.com/questions/3746725/how-to-create-an-array-containing-1-n
    const values = ["cherry", "blueberry", "grapes", "lemon"];
    // https://3dtransforms.desandro.com/card-flip
    return html`<div class="board">
      <input
        type="button"
        value="flip all"
        onclick=${() => {
          this.flipAll();
        }}
      />
      <div class="cards">
        ${this.items.map(({ num, value, isFlipped }, idx) => {
          return html`<div
            onclick=${(e) => {
              this.flip({ num });
            }}
            id="card_${num}"
            class="card ${isFlipped ? "flipped" : ""}"
          >
            <div class="face front ${values[value]}">${num}</div>
            <div class="face back">${num}</div>
          </div>`;
        })}
      </div>
    </div>`;
  }

  load(el) {
    this.el = el;
    this._loadedResolve();
  }

  update() {
    return false;
  }
}

module.exports = exports = Component;
