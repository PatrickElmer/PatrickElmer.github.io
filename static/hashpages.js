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
  onHashLoad();
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

function openExternalLinksInNewTab() {
  document.querySelectorAll("a").forEach(function (link) {
    if (!link.hash) {
      link.setAttribute("target", "_blank");
    }
  });
}

function onHashLoad() {
  openExternalLinksInNewTab();
}

async function fetchEncryptedJson() {
  let uri = sessionStorage.getItem("hashPassword");
  if (!uri) {
    uri = prompt("Please enter the password");
    if (!uri) {
      console.error("No password provided. Could not retrieve data!");
      return;
    }
  }
  let response = await fetch(`static/${sha256(uri)}.json`);
  if (!response.ok) {
    console.error("Password incorrect. Could not retrieve data!");
    return;
  }
  let content = await response.text();
  console.log(content);
  sessionStorage.setItem("hashPassword", uri);
}

fetchEncryptedJson();
