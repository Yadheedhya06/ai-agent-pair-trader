import { alertDiscord } from "@/app/api/cron/discord/route";

(async () => {
  try {
    await alertDiscord();
  } catch (error) {
    console.error('Error running alertDiscord:', error);
  }
})();
