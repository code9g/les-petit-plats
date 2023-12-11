export function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

export function replaceDiacritic(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
