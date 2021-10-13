chrome.runtime.onInstalled.addListener(()=>{
})
let currentTab;
let Tabs = [];
let dataForDB = [];
chrome.tabs.onCreated.addListener((tab)=>{
  Tabs.push(addTempWebsite(tab));
  console.log(Tabs)
  currentTab = tab.id;
});

chrome.tabs.onUpdated.addListener((tab)=>{
  let updatedTab = chrome.tabs.get(tab);
  updatedTab.then((result)=> {
    if(result.status === "complete") {
      for(let i = 0; i<Tabs.length; i++) {
        if(result.id === Tabs[i].id) {
          if(refomatUrl(result.url) !== Tabs[i].url){
            addWebsiteToDB(Tabs[i]);
            let date = new Date(Date.now());
            let starttime = date.getTime();
            Tabs[i].url = refomatUrl(result.url);
            Tabs[i].start = starttime;
          }
        }
      }
      //console.log(Tabs);
    }
  })
});

chrome.tabs.onHighlighted.addListener((tab)=>{
  console.log(tab)  
})

chrome.tabs.onRemoved.addListener((tab)=>{
  let currentIndex = -1;
  for(let k = 0; k < Tabs.length ; k++){
    if(Tabs[k].id === tab){
      addWebsiteToDB(Tabs[k])
      currentIndex = k;
    }
  }
  Tabs.splice(currentIndex ,1);
  console.log(Tabs);
  console.log(dataForDB);
})


const addTempWebsite = (tab) => {
  let date = new Date();
  let starttime = date.getTime();
  let data = {
    "id" : tab.id,
    "start": starttime,
    "url": tab.url
  }
  return data;
}

//
//let data = {
//  "id" : 23232322,
//  "start": 123214341241,
//  "url" : "www.google.de"
//}
const addWebsiteToDB = (website) => {
  if (website.url === ""){
    return
  }
  let date = new Date();
  let endtime = date.getTime();
  let difference = Math.abs(endtime - website.start);
  let seconds = Math.floor(difference / 1000);
  let websiteDataWebsite = {
    url : website.url,
    seconds : seconds,
  }
  for(let o = 0; o < dataForDB.length; o++){
    if( dataForDB[o].url === websiteDataWebsite.url){
      dataForDB[o].seconds += websiteDataWebsite.seconds;
      return;
    }
  }
  dataForDB.push(websiteDataWebsite);
}



// indexeddb
let openRequest = indexedDB.open("TabsTrackerDB", 1);

openRequest.onupgradeneeded = function() {
  // triggers if the client had no database
  // ...perform initialization...
  let db = openRequest.result;
  if (!db.objectStoreNames.contains('websites')) { // if there's no "books" store
    db.createObjectStore('websites', {keyPath: 'name'}); // create it
  }
};

openRequest.onerror = function() {
  console.error("Error", openRequest.error);
};

openRequest.onsuccess = function() {
  let db = openRequest.result;
  // continue working with database using db object
  db.onversionchange = function() {
    db.close();
    alert("Database is outdated, please reload the page.")
  };
};

//Create a transaction, mentioning all the stores it’s going to access, at (1).
//Get the store object using transaction.objectStore(name), at (2).
//Perform the request to the object store books.add(book), at (3).
//…Handle request success/error (4), then we can make other requests if needed, etc.
//add makes a new key pair value, throws an error if it already exsists
//put creates a new one, if it alreadey exsites it replaced it.
//websiteData = {
//  name = "name",
//  time = "00:00:00:01" Days, Hours, Minutes, Seconds
//}
const addWebsite = (websiteData) => {
  let transaction = db.transaction("websites", "readwrite"); //(1)
  let websitesStore = transaction.objectStore("websites"); //(2)
  let request = websitesStore.put(websiteData); //(3)
  request.onsuccess = () => { //(4)
    console.log("Website added to the store", request.result);
  };
  
  request.onerror = () => {
    console.log("Error", request.error);
  };
  transaction.oncomplete = function() {
    console.log("Transaction is complete");
  }
}

const refomatUrl = (url) =>{
  let start = url.indexOf("//")+2;
  let end = url.indexOf("/",start);
  let formatedUrl = url.slice(start,end);
  return formatedUrl;
}

const Template= {
  "name":"test",
  "sec": 1
}
const storeDate = (url, websites) => {
    if(websites){
      if(websites.hasOwnProperty(url)){
        websites[url] += 1;
      }
      else{
        Object.defineProperty(websites,url,{
          "value":1,
          writable:true
        })
      }
      return websites;
    }
}
