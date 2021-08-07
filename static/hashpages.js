window.addEventListener("hashchange", onRouteChange);
window.addEventListener("DOMContentLoaded", onRouteChange);
hashPages = document.querySelector("#hashpages");

// Special html page content
const page_404 = "<h1>404. Page not found.</h1>";
const page_fail =
  "<h1>Authentication failure.</h1><p>No password provided. Could not retrieve data!";
const page_no_pass =
  "<h1>Login credentials could not be verified.</h1><p>Either the passcode you provided is incorrect, or you are trying to access a page that does not exist. Please reload and try again.</p>";

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
  onHashLoad();
}

async function loadContent(uri) {
  const path = getPath();

  // Abort if path could not be determined
  if (!path) {
    updateHashPages(page_fail);
    return;
  }

  if (await fetchData(`${path}/${uri}.md`)) {
    // Check if Password needs to be set
    if (
      hashPages.dataset.passwordprotected !== undefined &&
      !sessionStorage.getItem("hashPassword")
    ) {
      // Password correct, but not previously known
      sessionStorage.setItem("hashPassword", path);
    }
    return;
  }

  // New password provided, but page could not be loaded
  if (
    hashPages.dataset.passwordprotected !== undefined &&
    !sessionStorage.getItem("hashPassword")
  ) {
    updateHashPages(page_no_pass);
    return;
  }

  // Try fetching html or 404 page
  // if (!(await fetchData(`${path}/${uri}.html`))) {
  //   if (!(await fetchData(`${path}/404.md`))) {
  updateHashPages(page_404);
  //   }
  // }
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

function getPath() {
  // Pages without password protection
  if (hashPages.dataset.passwordprotected === undefined) {
    return "pages";
  }

  // If password is already set
  if (sessionStorage.getItem("hashPassword")) {
    return sessionStorage.getItem("hashPassword");
  }

  // Prompt for new password
  let passphrase = prompt("Please enter the passphrase:");
  if (!passphrase) {
    console.error("No password provided. Could not retrieve data!");
    return false;
  }
  return sha256(passphrase);
}
