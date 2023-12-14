import { escapeRegex, replaceDiacritic } from "../utils/tools.js";

const inputEvent = new CustomEvent("input", { bubbles: true });

const mutaterOpen = {
  enumerable: true,
  configurable: true,
  get: function () {
    return this.classList.contains("open");
  },
  set: function (value) {
    if (value === true) {
      this.show();
    } else {
      this.close();
    }
  },
};

function clearInput(element, dispatch = true) {
  if (element.value !== "") {
    element.value = "";
    if (dispatch) {
      element.dispatchEvent(inputEvent);
    }
  }
}

export function dropdownFilterTemplate(
  name,
  title,
  items,
  onSelect = null,
  onUnselect = null
) {
  const result = document.createElement("div");
  result.id = `${name}-filter`;
  result.className = "dropdown";
  result.tabIndex = 0;
  result.dataset.name = name;
  result.dataset.title = title;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "dropdown-button";
  button.textContent = title;

  const content = document.createElement("div");
  content.className = "dropdown-content";

  const search = document.createElement("div");
  search.className = "dropdown-search";

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "btn-clear";

  const input = document.createElement("input");
  input.type = "text";
  input.id = `${name}-search`;
  input.name = input.id;
  input.className = "input-search";
  input.placeholder = "Rechercher...";
  input.tabIndex = -1;
  input.autofocus = true;

  search.appendChild(input);
  search.appendChild(reset);

  content.appendChild(search);

  const ul = document.createElement("ul");
  ul.className = "dropdown-items";

  const selectListener = (e) => {
    e.preventDefault();
    const target = e.currentTarget.closest("li");
    if (!target.classList.contains("selected")) {
      target.classList.add("selected");
      if (onSelect) {
        onSelect(result, target);
      }
    }
  };

  const unselectListener = (e) => {
    e.preventDefault();
    const target = e.currentTarget.closest("li");
    if (target.classList.contains("selected")) {
      target.classList.remove("selected");
      if (onUnselect) {
        onUnselect(result, target);
      }
    }
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const li = document.createElement("li");
    li.className = "dropdown-item";

    li.dataset.search = replaceDiacritic(item.trim()).toLowerCase();
    li.dataset.key = i;

    const btnSelect = document.createElement("button");
    btnSelect.className = "btn-select";
    btnSelect.type = "button";
    btnSelect.ariaLabel = `Sélectionner ${item}`;
    btnSelect.textContent = item;
    btnSelect.addEventListener("click", selectListener);
    li.appendChild(btnSelect);

    const btnUnselect = document.createElement("button");
    btnUnselect.className = "btn-unselect";
    btnUnselect.type = "button";
    btnUnselect.ariaLabel = "Déselectionner";
    btnUnselect.ariaHidden = true;
    li.appendChild(btnUnselect);

    //li.addEventListener("click", selectListener);
    btnUnselect.addEventListener("click", unselectListener);

    ul.appendChild(li);
  }

  const liEmpty = document.createElement("li");
  liEmpty.className = "dropdown-empty hidden";
  liEmpty.textContent = "Aucun résultat";
  ul.appendChild(liEmpty);

  content.appendChild(ul);
  result.appendChild(button);
  result.appendChild(content);

  Object.defineProperty(result, "open", mutaterOpen);

  result.show = function () {
    if (!this.open) {
      clearInput(input);
      this.classList.add("open");
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  };

  result.close = function () {
    if (this.open) {
      result.classList.remove("open");
    }
  };

  input.addEventListener("input", () => {
    const text = replaceDiacritic(input.value.trim());
    const re = new RegExp(escapeRegex(text), "gi");
    let counter = 0;
    for (const li of ul.querySelectorAll(".dropdown-item")) {
      const ref = li.dataset.search;
      if (re.exec(ref)) {
        li.classList.remove("hidden");
        counter++;
      } else {
        li.classList.add("hidden");
      }
    }
    const last = ul.lastChild;
    if (counter == 0) {
      last.classList.remove("hidden");
    } else {
      last.classList.add("hidden");
    }
  });

  button.addEventListener("click", (e) => {
    if (result.open) {
      result.close();
    } else {
      result.show();
    }
  });

  reset.addEventListener("click", (e) => {
    e.preventDefault();
    clearInput(input);
    input.focus();
  });

  return result;
}
