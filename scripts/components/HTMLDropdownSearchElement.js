const openEvent = new CustomEvent("open");
const closeEvent = new CustomEvent("close");

export class HTMLDropdownSearchElement extends HTMLElement {
  static observedAttributes = ["id", "open"];
  constructor() {
    super();
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(value) {
    if (value) {
      this.show();
    } else {
      this.close();
    }
  }

  show() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }

  connectedCallback() {
    console.log("Custom element added to page.");
    //const shadow = this.attachShadow({ mode: "open" });
    const shadow = this;

    const dropdownButton = document.createElement("div");
    dropdownButton.className = "dd-button";

    const text = document.createElement("div");
    text.textContent = this.getAttribute("title");

    const img = document.createElement("img");
    img.src = "assets/img/down.svg";

    dropdownButton.appendChild(text);
    dropdownButton.appendChild(img);

    shadow.appendChild(dropdownButton);
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "open":
        this.dispatchEvent(newValue === null ? closeEvent : openEvent);
        break;
      default:
        console.log(
          `Attribute ${name} has changed. ${oldValue} <> ${newValue}`
        );
    }
  }
}

export const register = () => {
  customElements.define("dropdown-search", HTMLDropdownSearchElement);
};

register();
