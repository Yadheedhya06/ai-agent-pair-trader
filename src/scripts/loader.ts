import {
  Character,
  elizaLogger,
  validateCharacterConfig,
  defaultCharacter,
} from "@ai16z/eliza";
import fs from "fs";

function tryLoadFile(filePath: string): string | null {
  // Check for --characters flag
  const args = process.argv;
  const charactersFlag = args.find((arg) => arg.startsWith("--characters="));
  const characterPath = charactersFlag?.split("=")[1];

  if (characterPath) {
    filePath = characterPath;
  }

  try {
    console.log('file path is: ',filePath)
    return fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return null;
  }
}

function isAllStrings(arr: unknown[]): boolean {
  return Array.isArray(arr) && arr.every((item) => typeof item === "string");
}

export async function loadCharacters(): Promise<Character[]> {
  const loadedCharacters: Character[] = [];
  const content = tryLoadFile("/Users/yadheedhyaindugubilli/Developer/Projects/Personal/Self/ai-agent-pair-trader/characters/trade.character.json");

  if (!content) {
    elizaLogger.error(
      `Error loading character from /Users/yadheedhyaindugubilli/Developer/Projects/Personal/Self/ai-agent-pair-trader/characters/trade.character.json: File not found`,
    );
    process.exit(1);
  }

  try {
    const character = JSON.parse(content);
    validateCharacterConfig(character);

    if (isAllStrings(character.plugins)) {
      elizaLogger.info("Plugins are: ", character.plugins);
      const importedPlugins = await Promise.all(
        character.plugins.map(async (plugin: any) => {
          const importedPlugin = await import(plugin);
          return importedPlugin.default;
        }),
      );
      character.plugins = importedPlugins;
    }

    loadedCharacters.push(character);
    elizaLogger.info(`Successfully loaded character`);
  } catch (e) {
    elizaLogger.error(`Error parsing character from`);
    process.exit(1);
  }

  if (loadedCharacters.length === 0) {
    elizaLogger.info("No characters found, using default character");
    loadedCharacters.push(defaultCharacter);
  }

  return loadedCharacters;
}
