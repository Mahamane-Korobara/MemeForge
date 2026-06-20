type ClassValue = string | number | boolean | null | undefined | ClassValue[] | Record<string, boolean>;

function flattenClassValue(value: ClassValue): string[] {
  if (!value) return [];
  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenClassValue);
  }

  return Object.entries(value)
    .filter(([, isActive]) => isActive)
    .map(([className]) => className);
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(flattenClassValue).join(" ");
}
