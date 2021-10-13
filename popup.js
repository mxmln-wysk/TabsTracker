const div = document.getElementById("mostTimeURL");

chrome.storage.local.get(["websitesData"], function(result) {
    console.log(result.key);
    console.log("test");
  });
  