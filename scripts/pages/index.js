import { recipes, ingredients, ustensils, appliances } from "../recipes.js";
import { dropdownFilterTemplate } from "../templates/dropdownFilter.js";
import { recipeCardTemplate } from "../templates/recipeCard.js";
import { tagTemplate } from "../templates/tag.js";
import { clearInput, escapeRegex, replaceDiacritic } from "../utils/tools.js";

class App {
  constructor() {
    this.recipes = null;
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
    this.removeTag(
      this.tags.querySelector(
        `.tag[data-target="${dropdown.id}"][data-key="${item.dataset.key}"]`
      )
    );
    dropdown.close();
  }

  addTag(target, key, text) {
    const tag = tagTemplate(target, key, text, (e) => {
      e.preventDefault();
      this.removeTag(e.currentTarget.closest(".tag"));
    });
    document
      .querySelector(`#${target} li[data-key="${key}"]:not(.selected)`)
      ?.classList.add("selected");
    this.tags.appendChild(tag);
    this.tags.classList.remove("hidden");
    this.updateSearch();
  }

  removeTag(element) {
    document
      .querySelector(
        `#${element.dataset.target} li[data-key="${element.dataset.key}"].selected`
      )
      ?.classList.remove("selected");
    element.remove();
    if (!this.tags.querySelector(".tag")) {
      this.tags.classList.add("hidden");
    }
    this.updateSearch();
  }

  handleClick(e) {
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

  async run() {
    // Load
    // Prepare
    // Render
    const filter1 = dropdownFilterTemplate(
      "ingredients",
      "Ingrédients",
      ingredients,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    const filter2 = dropdownFilterTemplate(
      "appliances",
      "Appareils",
      appliances,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    const filter3 = dropdownFilterTemplate(
      "ustensils",
      "Ustensiles",
      ustensils,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );

    const filters = document.querySelector(".filters");

    filters.append(filter1);
    filters.append(filter2);
    filters.append(filter3);

    this.tags = document.querySelector("#tags .container");

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", this.handleClick.bind(this));

    const wrapper = document.querySelector(".recipes .cards");
    for (const recipe of recipes) {
      wrapper.appendChild(recipeCardTemplate(recipe));
    }
    document.querySelectorAll(".results").forEach((element) => {
      element.textContent = `${recipes.length} recette(s)`;
    });

    const inputSearch = document.querySelector("#search");
    inputSearch.addEventListener("input", (e) => {
      e.preventDefault();
      if (inputSearch.value.length > 2) {
        this.updateSearch();
      }
    });

    document
      .querySelector("form[name=search] .btn-search")
      .addEventListener("click", (e) => {
        e.preventDefault();
        this.updateSearch();
      });

    document
      .querySelector("form[name=search] .btn-clear")
      .addEventListener("click", (e) => {
        e.preventDefault();
        const laucnSearch = inputSearch.value.length > 2;
        inputSearch.value = "";
        if (laucnSearch) {
          this.updateSearch();
        }
      });
  }

  updateSearch() {
    console.log("Update search started !");
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
