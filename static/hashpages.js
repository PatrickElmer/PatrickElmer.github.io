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
  let path = "pages";
  let protectedPath = false;

  if (window.location.pathname === "/proto-ryukyuan/") {
    protectedPath = sessionStorage.getItem("hashPassword");
    if (!protectedPath) {
      protectedPath = await fetchPasswordProtected();
      if (!protectedPath) {
        console.warn("Authentication issue!");
        return;
      }
    }
    path = protectedPath;
  }

  if (await fetchData(`${path}/${uri}.md`)) {
    // Check if Password needs to be set
    if (protectedPath) {
      // Password was correct
      if (!sessionStorage.getItem("hashPassword")) {
        // Password correct, but not previously known
        sessionStorage.setItem("hashPassword", protectedPath);
      }
    }
  } else {
    if (!(await fetchData(`${path}/${uri}.html`))) {
      if (!(await fetchData(`${path}/404.md`))) {
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

// Function for password protecting the content of the pages
// (not in use yet)

async function fetchPasswordProtected() {
  let uri = sessionStorage.getItem("hashPassword");
  if (!uri) {
    uri = prompt("Please enter the password");
    if (!uri) {
      console.error("No password provided. Could not retrieve data!");
      return false;
    }
  }

  console.log(sha256(uri));
  // sessionStorage.setItem("hashPassword", uri);
  return sha256(uri);
}

// console.log(sha256("passwort123"));
