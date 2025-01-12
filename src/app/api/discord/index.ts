import { ApplicationDatabase } from "@/scripts/db/appDB";
import { CorrelationStrength } from "../../../../public/types/correlation";

async function main() {
  const startTime = performance.now();
  
  const db = new ApplicationDatabase()
  const correlation = await db.getRandomCorrelationByCategory(CorrelationStrength.STRONG)
  console.log(correlation)
  
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Function execution time: ${executionTime.toFixed(2)} milliseconds`);
}

main().catch(console.error);