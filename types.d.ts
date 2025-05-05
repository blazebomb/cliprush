import { Connection } from "mongoose"

declare global {
  // This is a declaration, not a runtime `var`
  // So it's correct to use `var` here
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Connection | null
    promise: Promise<Connection> | null
  }
}

export {}
