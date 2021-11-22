const choo = require("choo");
const html = require("nanohtml");
const devtools = require("choo-devtools");

const css = require("sheetify");
css("./app.css");

const Board = require("../components/board");

module.exports = () => {
  const app = choo();

  const board = new Board();
  app.use(devtools());
  app.use((state) => {
    state.logger = false;
  });
  function mainView(state, emit) {
    return html`<body>
      ${board.render({ state, emit })}
    </body>`;
  }
  app.route("/", mainView);
  app.use((state, emitter) => {});
  app.mount("body");
};
