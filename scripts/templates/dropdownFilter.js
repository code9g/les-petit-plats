import { escapeRegex, replaceDiacritic } from "../utils/tools.js";

const inputEvent = new CustomEvent("input", { bubbles: true });

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

  const fooListener = (e) => {
    e.preventDefault();
    const target = e.currentTarget.closest("li");
    if (target.classList.contains("selected")) {
      target.classList.remove("selected");
      if (onUnselect) {
        onUnselect(result, target);
      }
    } else {
      target.classList.add("selected");
      if (onSelect) {
        onSelect(result, target);
      }
    }
  };

  items.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "dropdown-item";

    li.dataset.search = replaceDiacritic(item.trim()).toLowerCase();
    li.dataset.key = i;

    const link = document.createElement("a");
    link.href = "#";
    link.className = "dropdown-link";
    link.textContent = item.toCapitalize();
    link.addEventListener("click", fooListener);

    li.appendChild(link);

    ul.appendChild(li);
  });

  const liEmpty = document.createElement("li");
  liEmpty.className = "dropdown-empty hidden";
  liEmpty.textContent = "Aucun résultat";
  ul.appendChild(liEmpty);

  content.appendChild(ul);
  result.appendChild(button);
  result.appendChild(content);

  result.show = function () {
    if (!this.classList.contains("open")) {
      clearInput(input);
      this.classList.add("open");
      ul.scrollTop = 0;
      requestAnimationFrame(() => {
        input.focus();
      });
    }
  };

  result.close = function () {
    result.classList.remove("open");
  };

  //   Object.defineProperties(result, "open", {
  //     get: function () {
  //       return this.classList.contains("open");
  //     },
  //     set: function (value) {
  //       if (this.open) {
  //         this.close();
  //       } else {
  //         this.show();
  //       }
  //     },
  //   });

  //   console.log(result.open);

  input.addEventListener("input", () => {
    const text = replaceDiacritic(input.value.trim());
    const re = new RegExp(escapeRegex(text), "i");
    let counter = 0;
    ul.querySelectorAll(".dropdown-item").forEach((li) => {
      if (re.exec(li.dataset.search)) {
        li.classList.remove("hidden");
        counter++;
      } else {
        li.classList.add("hidden");
      }
    });

    const last = ul.querySelector(".dropdown-empty");
    if (counter === 0) {
      last.classList.remove("hidden");
    } else {
      last.classList.add("hidden");
    }
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();
    if (result.classList.contains("open")) {
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
