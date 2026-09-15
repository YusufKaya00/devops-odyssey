import { parse } from 'shell-quote';

// Compare shell arguments, not lowercased text: paths and quoted data are case-sensitive.
export function commandsMatch(actual: string, expected: string): boolean {
  try {
    const variables = (name: string) => ({ variable: name });
    return JSON.stringify(parse(actual, variables)) === JSON.stringify(parse(expected, variables));
  } catch {
    return false;
  }
}

export function parseCommand(command: string, environment: Record<string, string> = {}) {
  return parse(command, environment);
}
