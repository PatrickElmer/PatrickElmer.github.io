window.addEventListener("hashchange", onRouteChange);
window.addEventListener("DOMContentLoaded", onRouteChange);
hashPages = document.querySelector("#hashpages");

const converter = new showdown.Converter();
converter.setOption("tables", true);
converter.setOption("disableForced4SpacesIndentedSublists", true);
converter.setOption("strikethrough", true);

function onRouteChange() {
  let hashLocation;
  if (window.location.hash.substring(1, 2) == "/") {
    hashLocation = window.location.hash.substring(2);
  } else {
    hashLocation = window.location.hash.substring(1);
  }
  if (!hashLocation) {
    hashLocation = "index";
  }
  loadContent(hashLocation);
}

async function loadContent(uri) {
  if (!(await fetchData(`pages/${uri}.md`))) {
    if (!(await fetchData(`pages/${uri}.html`))) {
      if (!(await fetchData(`pages/404.md`))) {
        updateHashPages("<h1>404. Page not found.</h1>");
      }
    }
  }
}

async function fetchData(link) {
  let response = await fetch(link);
  if (response.ok) {
    let content = await response.text();
    if (link.slice(-3) === ".md") {
      content = converter.makeHtml(content);
    }
    updateHashPages(content);
    return true;
  }
  return false;
}

function updateHashPages(content) {
  hashPages.innerHTML = "";
  hashPages.insertAdjacentHTML("afterbegin", content);
}
