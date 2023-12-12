import { recipes, ingredients, ustensils, appliances } from "../recipes.js";
import { recipeCardTemplate } from "../templates/recipeCard.js";
import { tagTemplate } from "../templates/tag.js";
import { escapeRegex, replaceDiacritic } from "../utils/tools.js";

const inputEvent = new CustomEvent("input");

function filterList(ul, text) {
  const re = new RegExp(escapeRegex(text), "gi");
  let counter = 0;
  for (const li of ul.childNodes) {
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
}

function clearInput(element, dispatch = true) {
  if (element.value !== "") {
    element.value = "";
    if (dispatch) {
      element.dispatchEvent(inputEvent);
    }
  }
}

function handleClick(e) {
  const opened = document.querySelectorAll(".dropdown.open");
  const target = e.target;
  const excepted =
    target.classList.contains("dropdown") || target.closest(".dropdown");

  opened.forEach((dropdown) => {
    if (dropdown !== excepted) {
      dropdown.close();
    }
  });
}

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

function createLiveSearch(
  name,
  title,
  items,
  onSelect = null,
  onUnselect = null,
  onOpen = null,
  onClose = null
) {
  const result = document.createElement("div");
  result.id = `${name}-filter`;
  result.className = "dropdown";
  result.tabIndex = 0;
  result.dataset.name = name;
  result.dataset.title = title;

  Object.defineProperty(result, "open", mutaterOpen);

  result.show = function () {
    if (!this.open) {
      if (onOpen) {
        onOpen(result);
      }
      result.classList.add("open");
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  };

  result.close = function () {
    if (this.open) {
      result.classList.remove("open");
      if (onClose) {
        setTimeout(() => {
          onClose(result);
        });
      }
    }
  };

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
  // event sur le changement de l'input par l'utilisateur
  input.addEventListener("input", (e) => {
    filterList(ul, replaceDiacritic(e.currentTarget.value.trim()));
  });

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

class App {
  constructor() {
    this.currentDropdown = null;
    this.recipes = null;
  }

  handleOpen(dropdown) {
    this.currentDropdown = dropdown;
    clearInput(dropdown.querySelector(".input-search"));
    console.log("Open: ", dropdown.id);
  }

  handleClose(dropdown) {
    if (this.currentDropdown === dropdown) {
      this.currentDropdown = null;
    }
    console.log("Close: ", dropdown.id);
  }

  handleSelect(dropdown, item) {
    this.addTag(
      dropdown.id,
      item.dataset.key,
      item.querySelector(".btn-select").textContent
    );
    dropdown.close();
  }

  handleUnSelect(dropdown, item) {
    const tagList = this.tags.querySelectorAll(".tag");
    for (const tag of tagList) {
      if (
        tag.dataset.target === dropdown.id &&
        tag.dataset.key === item.dataset.key
      ) {
        tag.remove();
        break;
      }
    }
    if (!this.tags.querySelector(".tag")) {
      this.tags.classList.add("hidden");
    }
    dropdown.close();
  }

  addTag(target, key, text) {
    const tag = tagTemplate(target, key, text, (e) => {
      e.preventDefault();
      this.removeTag(e.currentTarget.closest(".tag"));
    });
    this.tags.appendChild(tag);
    this.tags.classList.remove("hidden");
  }

  removeTag(element) {
    const dropdown = document.querySelector("#" + element.dataset.target);
    const li = dropdown.querySelector(
      `li[data-key="${element.dataset.key}"].selected`
    );
    li.classList.remove("selected");
    element.remove();
    console.log(this.tags.querySelector(".tag"));
    if (!this.tags.querySelector(".tag")) {
      this.tags.classList.add("hidden");
    }
  }

  // async load() {
  //   return await fetch("data/recipes.json").then((res) => res.json());
  // }

  // prepare(recipes) {
  //   const setUstensils = new Set();
  //   const setAppliances = new Set();

  //   const ingredients = [];

  //   let lastIngredientId = 0;
  //   let lastApplianceId = 0;
  //   let lastUstensilId = 0;

  //   for (const recipe of recipes) {
  //     recipe.visibility = false;
  //     recipe.setVisibility = function (value) {
  //       this.visibility = value;
  //       if (value) {
  //         for (const item of this.ingredients) {
  //           item.ingredient.counter++;
  //         }
  //         this.appliance.counter++;
  //         for (const ustensil of this.ustensils) {
  //           ustensil.counter++;
  //         }
  //       } else {
  //         for (const item of this.ingredients) {
  //           item.ingredient.counter--;
  //         }
  //         this.appliance.counter--;
  //         for (const ustensil of this.ustensils) {
  //           ustensil.counter--;
  //         }
  //       }
  //     };

  //     for (const ingredient of recipe.ingredients) {
  //       const name = ingredient.ingredient.trim().toCapitalize();
  //       const search = replaceDiacritic(name).toLowerCase();

  //       let find = ingredients.find((item) => {
  //         return item.search === search;
  //       });

  //       if (!find) {
  //         find = {
  //           id: ++lastIngredientId,
  //           name: name,
  //           search: search,
  //           counter: 0,
  //           recipes: [],
  //           get visibility() {
  //             return this.counter === 0;
  //           },
  //         };
  //         ingredients.push(find);
  //       }
  //       find.counter++;
  //       console.log(find.visibility);
  //       ingredient.ingredient = find;
  //     }

  //     const name = recipe.appliance.trim().toCapitalize();
  //     const search = replaceDiacritic(name).toLowerCase();
  //     if (!setAppliances.has(search)) {
  //       const newAppliance = {
  //         id: ++lastApplianceId,
  //         name: name,
  //         search: search,
  //       };
  //       setAppliances.add(search);
  //       appliances.push(newAppliance);
  //       recipe.appliance = newAppliance;
  //     }

  //     for (let i = 0; i < recipe.ustensils.length; i++) {
  //       const name = recipe.ustensils[i];
  //       const search = replaceDiacritic(name).toLowerCase;
  //       if (!setUstensils.has(search)) {
  //         const newUstensil = {
  //           id: ++lastUstensilId,
  //           name: name,
  //           search: search,
  //         };
  //         setUstensils.add(search);
  //         ustensils.push(newUstensil);
  //         recipe.ustensils[i] = newUstensil;
  //       }
  //     }
  //   }

  //   const fnSort = (item1, item2) => item1.name.localeCompare(item2.name);

  //   // ingredients.sort(fnSort);

  //   // appliances.sort(fnSort);

  //   // ustensils.sort(fnSort);

  //   recipes.sort(fnSort);
  //   console.log(recipes, ingredients);
  // }

  // filter() {}

  async run() {
    // const data = await this.load();
    // this.prepare(data);
    const filter1 = createLiveSearch(
      "ingredients",
      "Ingrédients",
      ingredients,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this),
      this.handleOpen.bind(this),
      this.handleClose.bind(this)
    );
    const filter2 = createLiveSearch(
      "appliances",
      "Appareils",
      appliances,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this),
      this.handleOpen.bind(this),
      this.handleClose.bind(this)
    );
    const filter3 = createLiveSearch(
      "ustensils",
      "Ustensiles",
      ustensils,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this),
      this.handleOpen.bind(this),
      this.handleClose.bind(this)
    );

    const filters = document.querySelector(".filters");

    filters.append(filter1);
    filters.append(filter2);
    filters.append(filter3);

    this.tags = document.querySelector("#tags .container");

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", handleClick);

    const wrapper = document.querySelector(".recipes .cards");
    for (const recipe of recipes) {
      wrapper.appendChild(recipeCardTemplate(recipe));
    }
  }

  updateSearch() {
    const search = "";
    // Récuperer le texte de la recherche principale
    // Récuperer les tags choisies
    // Filtrer les recettes en fonction du texte et des tags
    // Regénérer les listes des tags (ingrédients, appareils et ustensils)
    // Mettre à jour la liste des tags disponibles
    // Mettre à jour la liste des recettes
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.run();
});
