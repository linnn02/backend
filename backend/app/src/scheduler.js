import cron from "node-cron";
import { runHarvestingJob } from "./services/collector.service.js";
import { logger } from "./services/logger.js";

export const initCronJobs = () => {
  logger.info("[Scheduler] Initializing cron jobs.");

  cron.schedule("0 2 * * *", async () => {
    logger.info("[Scheduler] Running nightly harvest routine.");
    try {
      const result = await runHarvestingJob("quantum computing", 50);
      logger.info(`[Scheduler] Nightly harvest finished: ${JSON.stringify(result)}`);
    } catch (err) {
      logger.error(`[Scheduler] Nightly harvest failed: ${err.message}`);
    }
  });
};
