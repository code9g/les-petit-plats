const inputEvent = new CustomEvent("input", { bubbles: true });

export function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

export function replaceDiacritic(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

String.prototype.toCapitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

export function clearInput(element, dispatch = true) {
  if (element.value !== "") {
    element.value = "";
    if (dispatch) {
      element.dispatchEvent(inputEvent);
    }
  }
}
