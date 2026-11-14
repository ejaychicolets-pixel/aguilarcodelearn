const installButton = document.getElementById("install-app");
const installHelp = document.getElementById("install-help");
const appStatus = document.getElementById("app-status");
let installPrompt = null;

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

if (isInstalled()) {
  installButton.hidden = true;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.hidden = true;
  appStatus.textContent = "CodeLearn is installed on this device.";
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) {
    installHelp.showModal();
    return;
  }

  installPrompt.prompt();
  const choice = await installPrompt.userChoice;
  installPrompt = null;
  if (choice.outcome === "accepted") {
    installButton.hidden = true;
    appStatus.textContent = "Installing CodeLearn...";
  } else {
    appStatus.textContent = "Installation dismissed. You can install CodeLearn from your browser menu.";
  }
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => {
        appStatus.textContent = "Offline lessons are ready on this device.";
      })
      .catch((error) => {
        console.error("Could not enable offline lessons:", error);
        appStatus.textContent = "Offline setup failed. Refresh while online to try again.";
      });
  });
} else if (!window.isSecureContext) {
  appStatus.textContent = "For installation and offline use, open CodeLearn from an HTTPS website.";
}
