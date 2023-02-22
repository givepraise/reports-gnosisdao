import "ses";

import { createCompartment } from "./ses.js";
import { initDuckDb } from "./duckdb.js";
import { log } from "./report.js";

lockdown();

async function run() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.log("Usage: node index.js <report-name> <config-json>");
    return;
  }
  const reportName = args[0];
  const config = JSON.parse(args[1]);

  const db = await initDuckDb();

  const compartment = new createCompartment();
  const { namespace } = await compartment.import(reportName);
  const report = new namespace.default(config, db);

  try {
    log(`\n👍 Running report: ${report.manifest.name}\n`);
    log(`Config: ${JSON.stringify(config, null, 2)}\n`);

    const response = await report.run();

    log(`✅ Success!\n`);
    log(`Returned rows: ${response.length}\n`);

    console.log(`${JSON.stringify(response, null, 2)}\n`);
  } catch (e) {
    console.log("Error generating report:");
    console.log(e);
  }
}

run();