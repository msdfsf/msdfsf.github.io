var actionButton = {
  state: true,
  id: 'undefined'
}

var subsOnly = Object.create(actionButton);
subsOnly.id = 'subsOnly';

var modAsSub = Object.create(actionButton);
modAsSub.id = 'modAsSub';

var vipAsSub = Object.create(actionButton);
vipAsSub.id = 'vipAsSub';

var duplicateCheck = Object.create(actionButton);
duplicateCheck.id = 'duplicatesCheck';

var useGoogleSheets = Object.create(actionButton);
useGoogleSheets.id = 'useSheets';

var collectRequests = Object.create(actionButton);
collectRequests.id = 'collectRequests';
collectRequests.state = false;

var sub = Object.create(actionButton);
sub.id = 'addRecordIsSub';
sub.state = true;



var popupMenu;
var saveInterval;

var CHANNEL;
var MAX_CHOICE_LENGTH;

var entry = {
  name: 'HUI',
  choice: 'SOSAT',
  sub: false,
  months: 0,
  displayName: 'Hui',
  displayChoice: 'Sosat',
  li: null,
  id: -1
}

var folCount = 0;
var subCount = 0;

var folEntries = {};
var subEntries = {};

var newFolEntries = {};
var newSubEntries = {};

var subIcons = [];
var subIconsMonths = [];

function takeCareAboutItem(name, choice, sub, displayName, monthCount) {

  if (displayName == null) displayName = name;

  var wasSub = false;
  var duplicate = folEntries[name];
  if (duplicate == null) {
    duplicate = subEntries[name];
    wasSub = true;
  }

  var entry;

  if (duplicateCheck.state && duplicate != null) {
    
    entry = duplicate;
    entry.choice = choice;
    entry.sub = (wasSub) ? true : sub;
    entry.months = Number(monthCount);
    entry.displayName = displayName;
    entry.displayChoice = choice;

    if (updateEntry(entry, wasSub)) return;
  
  } else {

    entry = {};
    entry.name = name;
    entry.choice = choice;
    entry.sub = sub;
    entry.months = Number(monthCount);
    entry.displayName = displayName;
    entry.displayChoice = choice;

    if (addEntry(entry)) return;
  
  }

  saveState(entry);

}

function addEntry(entry) {

  if (entry.name === '' || entry.choice === '') return true;

  var list;

  if (entry.sub) {
    subCount++;
    entry.id = subCount;
    list = document.getElementById('subList');
  } else {
    folCount++;
    entry.id = folCount;
    list = document.getElementById('folList');
  }

  var lsEntry = document.createElement('li');

  newEntry = formatEntry(lsEntry, entry);
  newEntry.classList.add('itemStyle');

  entry.li = newEntry;

  list.appendChild(newEntry);
  newEntry.classList.toggle('itemShow');

  return false;

}

function updateEntry(entry, wasSub = true) {

  if (entry.name === '' || entry.choice === '') return true;

  if (!wasSub && entry.sub) {
    
    entry.sub = wasSub;
    removeEntry(entry);

    entry.sub = true;
    addEntry(entry);
    
    return false;

  }

  var lsEntry = entry.li;
  lsEntry.innerHTML = '';
  formatEntry(lsEntry, entry);

  return false;

}

function formatEntry(lsEntry, entry, imgNum = null) {

  if (entry.choice.length > MAX_CHOICE_LENGTH) {
    entry.displayChoice = entry.choice.substring(0, MAX_CHOICE_LENGTH);
  }

  var icoIdx;

  if (imgNum == null) {
    icoIdx = findRightBadgeIndex(subIconsMonths, entry.months);
    if (entry.sub && icoIdx === 0) icoIdx = 1;
  } else {
    icoIdx = imgNum;
  }

  var img = document.createElement("img");
  img.src    = subIcons[icoIdx];
  img.height = '16';

  var left = document.createElement("span");
  var right = document.createElement("span");
  left.style.float = "left";
  right.style.float = "right";

  var dotButton = document.createElement('div');
  dotButton.className += 'dotButton ';
  dotButton.innerHTML = '⋮';
  dotButton.title = '';

  dotButton.addEventListener('click', function(event) {

    event.stopPropagation();
    popupMenu.redraw(event.clientX, event.clientY, event);
  
  });

  if (icoIdx >= 0) left.appendChild(img);
  left.innerHTML += " " + entry.displayName;
  right.innerHTML = '&nbsp' + entry.displayChoice;
  right.appendChild(dotButton);
  right.title = entry.choice;

  var div = document.createElement("div");
  div.style.clear = "both";

  lsEntry.appendChild(left);
  lsEntry.appendChild(right);
  lsEntry.appendChild(div);

  lsEntry.entry = entry;

  return lsEntry;

}

function findRightBadge(badges, month) {

  month = Number(month);
  if (isNaN(month)) return 0;

  var lastNumber = 0;
  for (i = 0; i < badges.length; i++) {

    var tmp = badges[i];
    if (tmp == month) return tmp;
    if (tmp < month && lastNumber <= tmp) lastNumber = tmp;
  
  }
          
  return Number(lastNumber);

}

function findRightBadgeIndex(badges, month) {

  month = Number(month);
  if (isNaN(month)) return 0;

  var lastNumber = 0;
  let i;
  for (i = 0; i < badges.length; i++) {

    var tmp = badges[i];
    if (tmp == month) return Number(i);
    if (tmp < month && lastNumber <= tmp) lastNumber = tmp;
  
  }
          
  return Number(i - 1);

}

function saveState(entry) {

  var id;

  if (entry.sub) {

    subEntries[entry.name] = entry;
    newSubEntries[entry.name] = entry;
    id = 'sub_' + entry.id;
    localStorage.setItem('sub_count', subCount);
  
  } else {

    folEntries[entry.name] = entry;
    newFolEntries[entry.name] = entry;
    id = 'fol_' + entry.id;
    localStorage.setItem('fol_count', folCount);

  }

  localStorage.setItem(id, entry.name + ' ' + entry.sub + ' ' + entry.months + ' ' + entry.displayName + ' ' + entry.choice);

}

function removeEntry(entry) {
  
  entry.li.parentNode.removeChild(entry.li);

  var id;

  if (entry.sub) {

    id = 'sub_' + subCount;
    delete subEntries[entry.name];
    subCount--;
    localStorage.setItem('sub_count', subCount);
  
  } else {

    id = 'fol_' + folCount;
    delete subEntries[entry.name];
    folCount--;
    localStorage.setItem('fol_count', folCount);

  }

  localStorage.removeItem(id);

}

function saveButtonState(button) {
  localStorage.setItem(button.id, button.state);
}

function loadButtonState(button) {
  var tmp;
  if ((tmp = localStorage.getItem(button.id)) === null) return;
  button.state = (tmp === "true");
}

function prepareButton(button) {
  if (!button.state) document.getElementById(button.id).classList.toggle('buttonOff');
}

function saveTextBoxState(textBoxID) {
  var tb = document.getElementById(textBoxID);
  localStorage.setItem(textBoxID, tb.value);
}

function prepareTextBox(textBoxID) {
  var tmp;
  if ((tmp = localStorage.getItem(textBoxID)) === null) return;

  var tb = document.getElementById(textBoxID);
  tb.value = tmp;
}

function loadEntry(entryString) {

  var props = entryString.split(' ', 4);
  props.push(entryString.slice(props[0].length + props[1].length + props[2].length + props[3].length + 4));

  var entry = {};
  entry.name = props[0];
  entry.choice = props[4];
  entry.sub = props[1] === 'true';
  entry.months = Number(props[2]);
  entry.displayName = props[3];
  entry.displayChoice = entry.choice;

  return entry;

}

/*
function loadState() {

  loadButtonState(sub);
  loadButtonState(modAsSub);
  loadButtonState(vipAsSub);
  loadButtonState(subsOnly);
  loadButtonState(duplicateCheck);

  prepareButton(sub);
  prepareButton(modAsSub);
  prepareButton(vipAsSub);
  prepareButton(subsOnly);
  prepareButton(duplicateCheck);

  flCnt = Number(localStorage.getItem('fol_count'));
  sbCnt = Number(localStorage.getItem('sub_count'));

  for (let i = 1; i <= flCnt; i++) {

    var entryString = localStorage.getItem('fol_' + i);
    var entry = loadEntry(entryString);
    addEntry(entry);
    folEntries[entry.name] = entry;
  
  }

  for (let i = 1; i <= sbCnt; i++) {
   
    var entryString = localStorage.getItem('sub_' + i);
    var entry = loadEntry(entryString);
    addEntry(entry);
    subEntries[entry.name] = entry;
  
  }

}
*/

function loadState() {


  loadButtonState(sub);
  loadButtonState(modAsSub);
  loadButtonState(vipAsSub);
  loadButtonState(subsOnly);
  loadButtonState(duplicateCheck);

  prepareButton(sub);
  prepareButton(modAsSub);
  prepareButton(vipAsSub);
  prepareButton(subsOnly);
  prepareButton(duplicateCheck);

  flCnt = Number(localStorage.getItem('fol_count'));
  sbCnt = Number(localStorage.getItem('sub_count'));

  for (let i = 1; i <= flCnt; i++) {

    var entryString = localStorage.getItem('fol_' + i);
    var entry = loadEntry(entryString);
    addEntry(entry);
    folEntries[entry.name] = entry;
  
  }

  for (let i = 1; i <= sbCnt; i++) {
   
    var entryString = localStorage.getItem('sub_' + i);
    var entry = loadEntry(entryString);
    addEntry(entry);
    subEntries[entry.name] = entry;
  
  }

}

function loadSubIcons() {
  
  return getTwitchSubBadgesByID(getTwitchUserID('Krabick'));

}

function init() {

  // load sub icons to memory
  var tmp = loadSubIcons();
  subIcons = tmp.subIcons;
  subIconsMonths = tmp.months;

  // init consts
  CHANNEL = 'Krabick';// readCookie('channel');
  MAX_CHOICE_LENGTH = 60;

  // init vars
  saveInterval = 5;

  // init popup menu for entries
  pmOptions = [
    'search',
    'copy',
    'delete'
  ];

  pmIcons = [
    'Icons/search.svg',
    'Icons/copy.svg',
    'Icons/trash.svg'
  ];
  
  pmFunctions = [
    search,
    copyRecord,
    deleteRecord
  ];
  
  popupMenu = buildPopupMenu(pmOptions, pmIcons, pmFunctions, 20, -40, -40);
  popupMenu.hide();

  document.body.appendChild(popupMenu);

  function search(event) {

    var entry = event.target.parentNode.parentNode.entry;
    var url = 'https://www.youtube.com/results?search_query=' + entry.choice;
    window.open(url, '_blank').focus();

  }

  function copyRecord(event) {

    var entry = event.target.parentNode.parentNode.entry;

    const tmp = document.createElement('textarea');
    tmp.value = entry.choice;

    document.body.appendChild(tmp);
    
    tmp.select();
    document.execCommand('copy');
    
    document.body.removeChild(tmp);

  }

  function deleteRecord(event) {

    var entry = event.target.parentNode.parentNode.entry;
    removeEntry(entry);
    
  }

  // init twitch bot
  initTwitchBot(CHANNEL);

  // start server save timer
  serverSaveTimer(); // depends on saveInterval

}

function clearStorage() {

  localStorage.clear();
  window.location.reload(false); 

}

function logLocalStorageSpace() {

  var allStrings = '';
  for(var key in window.localStorage){
      if(window.localStorage.hasOwnProperty(key)){
          allStrings += window.localStorage[key];
      }
  }
  var ans = allStrings ? 3 + ((allStrings.length*16)/(8*1024)) + ' KB' : 'Empty (0 KB)';
  console.log(ans);

};

function serverSaveTimer() {

  if (saveInterval < 1) return;
  window.setTimeout(serverSaveTimer, saveInterval * 1000);
  
  // send new data to server and empty buffers
  
  if (isHashEmpty(newFolEntries) && isHashEmpty(newSubEntries))
    return;

  console.log('[SERVER_SAVE]\n')
  console.log(newFolEntries);
  console.log(newSubEntries);

  newFolEntries = {};
  newSubEntries = {};

}

function isHashEmpty(hash) {

  for (x in hash)
    return false;

  return true;

}

function displayError(error) {

  console.log('[ERROR] error');

}