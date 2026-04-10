import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

const path = resolve(process.cwd(), ".env");
if (existsSync(path)) {
  config({ path });
}
