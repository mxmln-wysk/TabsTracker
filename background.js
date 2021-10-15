chrome.runtime.onInstalled.addListener(()=>{
})
let currentTab = 0;
let currentIndex;
let Tabs = [];
let dataForDB = [];
let highlightedTab;
chrome.tabs.onCreated.addListener((tab)=>{
  console.log(tab)
});

chrome.tabs.onUpdated.addListener((tab)=>{
  let updatedTab = chrome.tabs.get(tab);
  updatedTab.then((result)=> {
    if(result.status === "complete") {//fires only if the Website is loaded
      for(let i = 0; i<Tabs.length; i++) {
        if(result.id === Tabs[i].id) {
          if(refomatUrl(result.url) !== Tabs[i].url){ //checks if URL has changed
            deleteTab(Tabs[i].id)
            addTempWebsite(result)
            console.log("add "+ result )
          }
        }
      }
    }
  })
});


chrome.tabs.onHighlighted.addListener((tab)=>{ 
  for(let u = 0; u< Tabs.length; u++){
    if(currentTab === Tabs[u].id){
      deleteTab(Tabs[u].id)
    }
  }
  console.log(tab)
  highlightedTab = chrome.tabs.get(tab.tabIds[0]);
  highlightedTab.then((result)=> {
    console.log("test")
    addTempWebsite(result)
    console.log("add "+ result )
    currentTab = result.id;
  })
})

chrome.tabs.onRemoved.addListener((tab)=>{
  deleteTab(tab);
  console.log(Tabs);
  console.log(dataForDB);
})

const deleteTab = (tab) => {
  let deleted = false;
  for(let k = 0; k < Tabs.length ; k++){
    if(Tabs[k].id === tab && deleted == false){
      currentIndex = k;
      addWebsiteToDB(Tabs[k])
      deleted = true;
    }
  }
  if( deleted == true){
    console.log("deleted "+ Tabs[currentIndex].url )
    Tabs.splice(currentIndex ,1);
    console.log("deleted")
  }
 }

const addTempWebsite = (tab) => {
  let date = new Date();
  let starttime = date.getTime();
  let tempUrl = refomatUrl(tab.url);
  let data = {
    "id" : tab.id,
    "start": starttime,
    "url": tempUrl
  }
  Tabs.push(data);
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
const refomatUrl = (url) =>{
  let start = url.indexOf("//")+2;
  let end = url.indexOf("/",start);
  let formatedUrl = url.slice(start,end);
  return formatedUrl;
}
//ToDo Local Storage