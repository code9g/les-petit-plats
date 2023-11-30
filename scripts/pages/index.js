import { recipes, ingredients, ustensils, appliances } from "../recipes.js";

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

function replaceDiacritic(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

class App {
  constructor() {}

  async run() {
    const i1 = document.querySelector("#ingredients-filter");
    const btn1 = i1.querySelector("button");

    btn1.addEventListener("click", (e) => {
      e.currentTarget
        .closest(".live-search")
        .querySelector(".content")
        .classList.toggle("hidden");
    });

    const ul1 = i1.querySelector(".list");
    ul1.innerHTML = "";
    for (const ingredient of ingredients) {
      const li = document.createElement("li");
      li.textContent = ingredient;
      ul1.appendChild(li);
    }

    const items1 = i1.querySelectorAll("li");

    i1.querySelector(".content input").addEventListener("input", (e) => {
      const text = replaceDiacritic(e.currentTarget.value.trim());
      if (text === "") {
        items1.forEach((element) => {
          element.classList.remove("hidden");
        });
      } else {
        const re = new RegExp(escapeRegex(text), "gi");
        items1.forEach((element) => {
          const ref = replaceDiacritic(element.innerText);
          console.log(ref);
          if (re.exec(ref)) {
            element.classList.remove("hidden");
          } else {
            element.classList.add("hidden");
          }
        });
      }
    });

    const wrapper = document.querySelector(".recipes .cards");
    wrapper.innerHTML = "";
    for (const recipe of recipes) {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.id = recipe.id;

      const img = document.createElement("img");
      img.src = `assets/photos/${recipe.image}`;
      img.className = "card-img-top";
      img.alt = "Photo de la recette";

      const body = document.createElement("div");
      body.className = "card-body";

      const h2 = document.createElement("h2");
      h2.className = "title";
      h2.textContent = recipe.name;

      const h3a = document.createElement("h3");
      h3a.textContent = "Recette";
      const pa = document.createElement("p");
      pa.className = "description";
      pa.textContent = recipe.description;

      const h3b = document.createElement("h3");
      h3b.textContent = "Ingrédients";

      const divb = document.createElement("div");
      divb.className = "ingredients";
      for (const ingredient of recipe.ingredients) {
        const divi = document.createElement("div");
        divi.className = "ingredient";
        const h4 = document.createElement("h4");
        h4.textContent = ingredient.ingredient;
        const p = document.createElement("p");
        p.className = "quantity";
        if (ingredient.unit) {
          p.textContent = `${ingredient.quantity} ${ingredient.unit}`;
        } else {
          p.textContent = `${ingredient.quantity}`;
        }
        divi.appendChild(h4);
        divi.appendChild(p);
        divb.appendChild(divi);
      }

      body.appendChild(h2);
      body.appendChild(h3a);
      body.appendChild(pa);
      body.appendChild(h3b);
      body.appendChild(divb);

      card.appendChild(img);
      card.appendChild(body);

      wrapper.appendChild(card);
    }
  }
}

const app = new App();

app.run();
