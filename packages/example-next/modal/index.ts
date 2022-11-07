import * as nodeLib from "./node";
import * as browserLib from "./browser";

const isNode = () =>
  typeof process !== "undefined" &&
  typeof process.versions !== "undefined" &&
  typeof process.versions.node !== "undefined";

function open(uri: string, cb: any) {
  // eslint-disable-next-line no-console
  console.log(uri);
  if (isNode()) {
    nodeLib.open(uri);
  } else {
    browserLib.open(uri, cb);
  }
}

function close() {
  if (isNode()) {
    nodeLib.close();
  } else {
    browserLib.close();
  }
}

const values = { open, close };

export default values;
