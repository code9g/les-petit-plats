import {
  dropdownFilterTemplate,
  updateFilter,
} from "../components/dropdownFilter.js";
import { headerTemplate } from "../templates/headerTemplate.js";
import { mainTemplate } from "../templates/mainTemplate.js";
import { recipeCardTemplate } from "../templates/recipeCardTemplate.js";
import { tagTemplate } from "../templates/tagTemplate.js";
import { debounce, escapeRegex, replaceDiacritic } from "../utils/tools.js";

const KEY_TIMEOUT = 300;
const INPUT_EVENT = new Event("input");

class App {
  constructor() {
    this.recipes = null;
    this.ingredients = [];
    this.appliances = [];
    this.ustensils = [];
  }

  // Chargement des données
  async load(url) {
    this.recipes = await fetch(url).then((res) => res.json());
  }

  // Préparation et normalisation des données
  prepare() {
    const setIngredients = new Set();
    const setUstensils = new Set();
    const setAppliances = new Set();

    for (const recipe of this.recipes) {
      for (const item of recipe.ingredients) {
        const text = item.ingredient.toCapitalize();
        item.ingredient = text;
        item.searchIngredient = replaceDiacritic(item.ingredient).toLowerCase();
        setIngredients.add(text);
      }
      setAppliances.add(recipe.appliance.toCapitalize());
      for (let i = 0; i < recipe.ustensils.length; i++) {
        const text = recipe.ustensils[i].toCapitalize();
        setUstensils.add(text);
        recipe.ustensils[i] = text;
      }
      recipe.searchName = replaceDiacritic(recipe.name).toLowerCase();
      recipe.searchDescription = replaceDiacritic(
        recipe.description
      ).toLowerCase();
      recipe.showBySearch = true;
      recipe.showByTags = true;
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
    await this.load("./data/recipes.json");
    this.prepare();
    this.render();
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
    this.updateTagSearch();
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
    this.updateTagSearch();
  }

  render() {
    const wrapper = document.querySelector(".wrapper");

    wrapper.appendChild(headerTemplate());
    wrapper.appendChild(mainTemplate());

    const handeSelect = (dropdown, item) => {
      this.addTag(dropdown.id, item.dataset.key, item.textContent);
      dropdown.close();
    };

    const handleUnSelect = (dropdown, item) => {
      this.removeTag(
        this.tags.querySelector(
          `.tag[data-target="${dropdown.id}"][data-key="${item.dataset.key}"]`
        )
      );
      dropdown.close();
    };

    this.ingredientDropdownList = dropdownFilterTemplate(
      "ingredients",
      "Ingrédients",
      this.ingredients,
      handeSelect,
      handleUnSelect
    );
    this.applianceDropdownList = dropdownFilterTemplate(
      "appliances",
      "Appareils",
      this.appliances,
      handeSelect,
      handleUnSelect
    );
    this.ustensilDropdownList = dropdownFilterTemplate(
      "ustensils",
      "Ustensiles",
      this.ustensils,
      handeSelect,
      handleUnSelect
    );

    const filters = document.querySelector(".filters");

    filters.appendChild(this.ingredientDropdownList);
    filters.appendChild(this.applianceDropdownList);
    filters.appendChild(this.ustensilDropdownList);

    this.tags = document.querySelector("#tags .container");
    this.recipeCounter = document.querySelector(".results");

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", (e) => {
      const excepted = e.target.closest(".dropdown");
      document.querySelectorAll(".dropdown.open").forEach((dropdown) => {
        if (dropdown !== excepted) {
          dropdown.close();
        }
      });
    });

    const cards = document.querySelector("#recipes .cards");
    for (const recipe of this.recipes) {
      const card = recipeCardTemplate(recipe);
      recipe.card = card;
      cards.appendChild(card);
    }
    this.updateRecipeCounter(this.recipes.length);

    const form = document.querySelector("form[name=search]");
    this.search = form.querySelector("input.input-search");

    this.search.addEventListener(
      "input",
      debounce(() => {
        this.updateMainSearch();
      }, KEY_TIMEOUT)
    );

    form.querySelector(".btn-clear").addEventListener("click", (e) => {
      e.preventDefault();
      this.search.value = "";
      this.search.dispatchEvent(INPUT_EVENT);
      this.search.focus();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.updateMainSearch();
    });
  }

  queryTagAll(target) {
    return Array.from(this.tags.querySelectorAll(target)).map(
      (item) => item.textContent
    );
  }

  updateTagSearch() {
    const ingredients = this.queryTagAll(".ingredient");
    const appliances = this.queryTagAll(".appliance");
    const ustensils = this.queryTagAll(".ustensil");

    this.recipes.forEach((recipe) => {
      recipe.showByTags =
        ingredients.every((ingredient) =>
          recipe.ingredients.find((item) => item.ingredient === ingredient)
        ) &&
        (appliances.length === 0 || appliances.includes(recipe.appliance)) &&
        ustensils.every((ustensil) => recipe.ustensils.includes(ustensil));
    });

    this.updateRecipes(this.recipes);
  }

  updateMainSearch() {
    const words = this.search.value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length >= this.search.minLength)
      .map((word) => new RegExp(escapeRegex(replaceDiacritic(word)), "i"));

    if (words.length > 0) {
      this.recipes.forEach((recipe) => {
        recipe.showBySearch = words.some(
          (re) =>
            re.exec(recipe.searchName) ||
            re.exec(recipe.searchDescription) ||
            recipe.ingredients.find((item) => re.exec(item.searchIngredient))
        );
      });
    } else {
      this.recipes.forEach((recipe) => {
        recipe.showBySearch = true;
      });
    }

    this.updateRecipes(this.recipes);
  }

  updateRecipes(recipes) {
    const ingredients = [];
    const appliances = [];
    const ustensils = [];

    let counter = 0;
    recipes.forEach((recipe) => {
      if (recipe.showBySearch && recipe.showByTags) {
        recipe.ingredients.forEach((item) => {
          if (!ingredients.includes(item.ingredient)) {
            ingredients.push(item.ingredient);
          }
        });
        if (!appliances.includes(recipe.appliance)) {
          appliances.push(recipe.appliance);
        }
        recipe.ustensils.forEach((item) => {
          if (!ustensils.includes(item)) {
            ustensils.push(item);
          }
        });
        recipe.card.classList.remove("hidden");
        counter++;
      } else {
        recipe.card.classList.add("hidden");
      }
    });

    this.updateRecipeCounter(counter);

    updateFilter(this.ingredientDropdownList, ingredients);
    updateFilter(this.applianceDropdownList, appliances);
    updateFilter(this.ustensilDropdownList, ustensils);
  }

  updateRecipeCounter(value) {
    this.recipeCounter.textContent = `${value} recette(s)`;
  }
}

const app = new App();
app.run();
