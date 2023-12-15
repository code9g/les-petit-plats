import { dropdownFilterTemplate } from "../templates/dropdownFilter.js";
import { recipeCardTemplate } from "../templates/recipeCard.js";
import { tagTemplate } from "../templates/tag.js";
import { escapeRegex, replaceDiacritic } from "../utils/tools.js";

class App {
  constructor() {
    this.recipes = null;
    this.ingredients = [];
    this.appliances = [];
    this.ustensils = [];
  }

  handleSelect(dropdown, item) {
    this.addTag(dropdown.id, item.dataset.key, item.textContent);
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
    const target = e.target;
    const excepted =
      target.classList.contains("dropdown") || target.closest(".dropdown");

    document.querySelectorAll(".dropdown.open").forEach((dropdown) => {
      if (dropdown !== excepted) {
        dropdown.close();
      }
    });
  }

  async load(url) {
    this.recipes = await fetch(url).then((res) => res.json());
  }

  prepare() {
    const setIngredients = new Set();
    const setUstensils = new Set();
    const setAppliances = new Set();

    for (const recipe of this.recipes) {
      for (const item of recipe.ingredients) {
        const text = item.ingredient.toCapitalize();
        item.ingredient = text;
        setIngredients.add(text);
      }
      setAppliances.add(recipe.appliance.toCapitalize());
      for (let i = 0; i < recipe.ustensils.length; i++) {
        const text = recipe.ustensils[i].toCapitalize();
        setUstensils.add(text);
        recipe.ustensils[i] = text;
      }
    }

    const fnSort = (item1, item2) => item1.localeCompare(item2);

    this.ingredients.push(...setIngredients);
    this.ingredients.sort(fnSort);

    this.ustensils.push(...setUstensils);
    this.ustensils.sort(fnSort);

    this.appliances.push(...setAppliances);
    this.appliances.sort(fnSort);

    this.recipes.sort((item1, item2) => {
      return fnSort(item1.name, item2.name);
    });
  }

  async run() {
    // Chargement des données
    await this.load("./data/recipes.json");

    // Préparation et normalisation des données
    this.prepare();

    // Mise en place du DOM
    const filter1 = dropdownFilterTemplate(
      "ingredients",
      "Ingrédients",
      this.ingredients,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    const filter2 = dropdownFilterTemplate(
      "appliances",
      "Appareils",
      this.appliances,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    const filter3 = dropdownFilterTemplate(
      "ustensils",
      "Ustensiles",
      this.ustensils,
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
    for (const recipe of this.recipes) {
      const card = recipeCardTemplate(recipe);
      recipe.card = card;
      wrapper.appendChild(card);
    }

    const form = document.querySelector("form[name=search]");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(h);

      this.updateSearch();
    });

    const inputSearch = document.querySelector("input.input-search");
    const KEY_TIMEOUT = 500;
    let h = null;
    inputSearch.addEventListener("input", (e) => {
      e.preventDefault();
      clearTimeout(h);
      h = setTimeout((e) => {
        if (inputSearch.value.length >= inputSearch.minLength) {
          this.updateSearch();
        }
      }, KEY_TIMEOUT);
    });
    form.querySelector(".btn-clear").addEventListener("click", (e) => {
      e.preventDefault();
      clearTimeout(h);
      inputSearch.value = "";
      inputSearch.focus();
      h = setTimeout(() => {
        this.updateSearch();
      }, KEY_TIMEOUT);
    });

    this.updateRecipeCounter(this.recipes.length);
  }

  updateSearch() {
    const ingredients = [];
    const appliances = [];
    const ustensils = [];

    const recipes = this.filter(
      this.recipes,
      document.querySelector("form[name=search] .input-search").value,
      Array.from(this.tags.querySelectorAll(".ingredient")).map(
        (item) => item.textContent
      ),
      Array.from(this.tags.querySelectorAll(".appliance")).map(
        (item) => item.textContent
      ),
      Array.from(this.tags.querySelectorAll(".ustensil")).map(
        (item) => item.textContent
      )
    );

    const cards = document.querySelectorAll(".recipe");
    let i = 0;
    const n = cards.length;
    recipes.forEach((recipe) => {
      console.log(recipe.card);
      if (!appliances.includes(recipe.appliance)) {
        appliances.push(recipe.appliance);
      }
      recipe.ingredients.forEach((ingredient) => {
        if (!ingredients.includes(ingredient.ingredient)) {
          ingredients.push(ingredient.ingredient);
        }
      });
      recipe.ustensils.forEach((ustensil) => {
        if (!ustensils.includes(ustensil)) {
          ustensils.push(ustensil);
        }
      });
      while (i < n) {
        const card = cards[i++];
        if (card.dataset.id == recipe.id) {
          card.classList.remove("hidden");
          break;
        } else {
          card.classList.add("hidden");
        }
      }
    });
    while (i < n) {
      cards[i++].classList.add("hidden");
    }

    const updateFilter = (target, list) => {
      document
        .querySelectorAll(target + " .dropdown-item")
        .forEach((element) => {
          if (list.includes(element.textContent)) {
            element.classList.remove("hidden");
          } else {
            element.classList.add("hidden");
          }
        });
    };

    updateFilter("#ingredients-filter", ingredients);
    updateFilter("#appliances-filter", appliances);
    updateFilter("#ustensils-filter", ustensils);

    this.updateRecipeCounter(recipes.length);
  }

  filter(recipes, search, ingredients, appliances, ustensils) {
    const re = new RegExp(escapeRegex(search), "i");

    return recipes.filter((recipe) => {
      // Filtre sur les ingrédients
      if (
        !ingredients.every((ingredient) =>
          recipe.ingredients.find((item) => item.ingredient === ingredient)
        )
      ) {
        return false;
      }
      // Filtre sur les appareils
      if (!appliances.every((appliance) => appliance === recipe.appliance)) {
        return false;
      }
      // Filter sur les ustensils
      if (
        !ustensils.every((ustensil) =>
          recipe.ustensils.find((item) => item === ustensil)
        )
      ) {
        return false;
      }
      return (
        search === "" ||
        re.exec(recipe.name) ||
        re.exec(recipe.description) ||
        recipe.ingredients.find((item) => re.exec(item.ingredient))
      );
    });
  }

  updateRecipeCounter(value) {
    document.querySelector(".results").textContent = `${value} recette(s)`;
  }
}

const app = new App();

document.addEventListener("DOMContentLoaded", () => {
  app.run();
});
