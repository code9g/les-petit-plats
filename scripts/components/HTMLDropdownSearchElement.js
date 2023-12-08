const openEvent = new CustomEvent("open");
const closeEvent = new CustomEvent("close");

export class HTMLDropdownSearchElement extends HTMLElement {
  static observedAttributes = ["open", "title"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
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

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "assets/css/dropdown.css";

    const dropdownButton = document.createElement("div");
    dropdownButton.className = "dropdown-toggle";
    dropdownButton.addEventListener("click", (e) => {
      this.open = !this.open;
    });
    dropdownButton.textContent = this.title;

    const content = document.createElement("div");
    content.className = "dropdown-content";

    const search = document.createElement("div");
    search.className = "dropdown-search";

    const inputSearch = document.createElement("input");
    inputSearch.className = "input-search";
    inputSearch.type = "text";
    search.appendChild(inputSearch);

    const items = document.createElement("ul");
    items.className = "dropdown-items";

    for (let i = 30; i > 0; i--) {
      const item = document.createElement("li");
      item.className = "dropdown-item";
      item.textContent = i;
      items.appendChild(item);
    }
    content.appendChild(search);
    content.appendChild(items);

    this.shadowRoot.appendChild(link);
    this.shadowRoot.appendChild(dropdownButton);
    this.shadowRoot.appendChild(content);
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
        this.#openChange(oldValue, newValue);
        break;
      case "title":
        this.#titleChange(oldValue, newValue);
        break;
    }
    console.log(`Attribute ${name} has changed. ${oldValue} => ${newValue}`);
  }

  #openChange(oldValue, newValue) {
    this.dispatchEvent(newValue === null ? closeEvent : openEvent);
  }

  #titleChange(oldValue, newValue) {
    const target = this.shadowRoot.querySelector(".dropdown-title");
    if (target) {
      target.textContent = newValue;
    }
  }
}

export const register = () => {
  customElements.define("dropdown-search", HTMLDropdownSearchElement);
};

register();
