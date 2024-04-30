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

export function updateFilter(dropdown, list) {
  let counter = 0;
  dropdown.querySelectorAll(".dropdown-item").forEach((element) => {
    if (list.includes(element.textContent)) {
      element.classList.remove("hidden");
      counter++;
    } else {
      element.classList.add("hidden");
    }
  });
  const liEmpty = dropdown.querySelector(".dropdown-empty");
  liEmpty.classList.toggle("hidden", counter !== 0);
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
    if (!this.isOpen()) {
      clearInput(input);
      this.classList.add("open");
      ul.scrollTop = 0;
      requestAnimationFrame(() => {
        input.focus();
      });
    }
  };

  result.isOpen = function () {
    return this.classList.contains("open");
  };

  result.toggle = function () {
    if (this.isOpen()) {
      this.close();
    } else {
      this.show();
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
        li.classList.remove("filtered");
        counter++;
      } else {
        li.classList.add("filtered");
      }
    });

    if (counter === 0) {
      liEmpty.classList.remove("hidden");
    } else {
      liEmpty.classList.add("hidden");
    }
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();
    result.toggle();
  });

  reset.addEventListener("click", (e) => {
    e.preventDefault();
    clearInput(input);
    input.focus();
  });

  return result;
}
