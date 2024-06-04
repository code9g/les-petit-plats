export function headerTemplate() {
  const header = document.createElement("header");
  header.className = "l-header";

  const container = document.createElement("div");
  container.className = "container";

  const top = document.createElement("div");
  top.className = "header-top";

  const link = document.createElement("a");
  link.className = "brand";
  link.href = ".";
  link.ariaCurrent = "page";

  const logo = document.createElement("img");
  logo.src = "assets/img/logo.png";
  logo.alt = "Logo Les petits plats";

  const content = document.createElement("div");
  content.className = "header-content";

  const title = document.createElement("h1");
  title.className = "title";
  title.textContent =
    "Cherchez parmi plus de 1500 recettes du quotiden, simples et délicieuses";

  const form = document.createElement("form");
  form.name = "search";
  form.className = "form-search";
  form.action = ".";
  form.method = "get";

  const input = document.createElement("input");
  input.id = "search";
  input.type = "text";
  input.name = "search";
  input.className = "input-search";
  input.minLength = 3;
  input.placeholder = "Rechercher une recette, un ingrédient, ...";

  const btnClear = document.createElement("button");
  btnClear.className = "btn-clear";
  btnClear.type = "reset";
  btnClear.ariaLabel = "Vider";

  const btnSearch = document.createElement("button");
  btnSearch.className = "btn-search";
  btnSearch.type = "submit";
  btnSearch.ariaLabel = "Rechercher";

  link.appendChild(logo);
  top.appendChild(link);
  content.appendChild(title);
  form.appendChild(input);
  form.appendChild(btnClear);
  form.appendChild(btnSearch);
  content.appendChild(form);
  container.appendChild(top);
  container.appendChild(content);
  header.appendChild(container);
  return header;
}
