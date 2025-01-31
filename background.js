// Create context menu
chrome.contextMenus.create({
  id: "copyImageName",
  title: "Copy Image Name",
  contexts: ["image"],
});

// Listen for click in context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "copyImageName" || !info.srcUrl) return;

  const imageName = extractImageName(info.srcUrl);

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      function: copyToClipboard,
      args: [imageName],
    })
    .then(([result]) => {
      if (result?.result?.success) {
        showNotification(`Copied: ${imageName}`, "success");
      } else {
        throw new Error(result?.result?.error || "Copy failed.");
      }
    })
    .catch((error) => {
      showNotification(`Error: ${error.message}`, "error");
    });
});

// Copy to clipboard within the page
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to copy. Click on the page first.",
    };
  }
}

// Get the image name from the URL
function extractImageName(url) {
  return url.split("/").pop().split("?")[0] || "untitled";
}

// Show notifications
function showNotification(message, type = "success") {
  chrome.notifications.create({
    type: "basic",
    iconUrl: type === "success" ? "images/success.png" : "images/error.png",
    title: type === "success" ? "Success" : "Error",
    message,
  });
}
