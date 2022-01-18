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




const SUB_TIER_COLORS = [
	'white',
	'#f5e942',
	'#4287f5',
	'#f54242'
];


var errorField;
var popupMenu;
var saveInterval;

const PARAM_DELIMITER = '{';
var CHANNEL;
var MAX_CHOICE_LENGTH;

// local storage keys prefixes
LS_LISTS = 'sapp_lists';

LS_SUB = 'saap_sub_';
LS_FOL = 'saap_fol_';

LS_SUB_COUNT = 'saap_sub_count_';
LS_FOL_COUNT = 'sapp_fol_count_';

var folCount = 0;
var subCount = 0;

var folEntries = {};
var subEntries = {};

var newFolEntries = {};
var newSubEntries = {};

var subIcons = [];
var subIconsMonths = [];

var lists = [];
var selectedList;
var activeListsCount = 0;

function takeCareAboutItem(list, name, choice, sub, displayName, monthCount, tier = 0) {

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
	entry.tier = tier;

    if (list.isActive) {
      if (updateEntry(entry, wasSub)) return;
    }

  } else {

    entry = {};
    entry.list = list;
    entry.name = name;
    entry.choice = choice;
    entry.sub = sub;
    entry.months = Number(monthCount);
    entry.displayName = displayName;
    entry.displayChoice = choice;
	entry.tier = tier;

    if (list.isActive) {
      if (addEntry(entry)) return;
    }
  
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
  left.style.color = (!SUB_TIER_COLORS[entry.tier]) ? SUB_TIER_COLORS[0] : SUB_TIER_COLORS[entry.tier];

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

  var lastIdx = 0;
  var lastNumber = 0;
  let i;
  for (i = 0; i < badges.length; i++) {

    var tmp = badges[i];
    if (tmp == month) return Number(i);
    if (tmp < month && lastNumber <= tmp) {
      lastIdx = i;
      lastNumber = tmp;
    }
  
  }
          
  return Number(lastIdx);

}

function saveState(entry) {

  var id;

  if (entry.sub) {

    // subEntries[entry.list.name + '_' + entry.name] = entry;
	subEntries[entry.name] = entry;
    newSubEntries[entry.list.name + '_' + entry.name] = entry;
    id = LS_SUB + entry.list.name + '_' + entry.id;
    localStorage.setItem(LS_SUB_COUNT + entry.list.name, subCount);
  
  } else {

    //folEntries[entry.list.name + '_' + entry.name] = entry;
    folEntries[entry.name] = entry;
	newFolEntries[entry.list.name + '_' + entry.name] = entry;
    id =  LS_FOL + entry.list.name + '_' + entry.id;
    localStorage.setItem(LS_FOL_COUNT + entry.list.name, folCount);

  }

  localStorage.setItem(
    id, 
    entry.list.name + PARAM_DELIMITER + entry.displayName + PARAM_DELIMITER + entry.sub + PARAM_DELIMITER + entry.tier + PARAM_DELIMITER + entry.months + PARAM_DELIMITER + entry.choice
  );

}

function removeEntry(entry) {
  
  entry.li.parentNode.removeChild(entry.li);

  var id;

  if (entry.sub) {

    id = LS_SUB + entry.list.name + '_' + subCount;
    delete subEntries[entry.name];
    subCount--;
    localStorage.setItem(LS_SUB_COUNT + entry.list.name, subCount);

    entry.choice = '';
    newSubEntries[entry.name] = entry;
  
  } else {

    id = LS_SUB + entry.list.name + '_' + folCount;
    delete subEntries[entry.name];
    folCount--;
    localStorage.setItem(LS_FOL_COUNT + entry.list.name, folCount);

    entry.choice = '';
    newFolEntries[entry.name] = entry;

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

  if (entryString == null) return null;

  var props = entryString.split(PARAM_DELIMITER, 5);
  props.push(entryString.slice(props[0].length + props[1].length + props[2].length + props[3].length + props[4].length + PARAM_DELIMITER.length * 5));

  var entry = {};
  entry.name = props[1].toLowerCase();
  entry.choice = props[5];
  entry.sub = props[2] === 'true';
  entry.tier = props[3];
  entry.months = Number(props[4]);
  entry.displayName = props[1];
  entry.displayChoice = entry.choice;

  return entry;

}

function loadListLocalStorage(lsName) {

  document.getElementById('subList').innerHTML = '';
  document.getElementById('folList').innerHTML = '';

  folEntries = {};
  subEntries = {};

  flCnt = Number(localStorage.getItem(LS_FOL_COUNT + lsName));
  sbCnt = Number(localStorage.getItem(LS_SUB_COUNT + lsName));

  lsName = lsName + '_';
  
  for (let i = 1; i <= flCnt; i++) {

    var entryString = localStorage.getItem(LS_FOL + lsName + i);
    var entry = loadEntry(entryString);
    if (entry == null) continue;

    addEntry(entry);
    folEntries[entry.name] = entry;
  
  }

  for (let i = 1; i <= sbCnt; i++) {
 
    var entryString = localStorage.getItem(LS_SUB + lsName + i);
    var entry = loadEntry(entryString);
    if (entry == null) continue;

    addEntry(entry);
    subEntries[entry.name] = entry;
  
  }

}

function loadStateLocalStorage() {

  var listsStr = localStorage.getItem(LS_LISTS);
  var listsArr = (listsStr == null || listsStr === '') ? [] : listsStr.split(PARAM_DELIMITER);

  if (listsArr.length > 0) {
    viewList(createNewList(listsArr[0]));
  }

  for (var i = 1; i < listsArr.length; i++) {
    createNewList(listsArr[i]);
  }

  loadListLocalStorage(listsArr[0]);

}

function loadListLocal(listName) {

  flCnt = Number(localStorage.getItem(LS_FOL_COUNT + entry.list.name));
  sbCnt = Number(localStorage.getItem(LS_SUB_COUNT + entry.list.name));

  const fol = LS_FOL + listName + '_';
  for (let i = 1; i <= flCnt; i++) {

    var entryString = localStorage.getItem(fol + i);
    var entry = loadEntry(entryString);
    if (entry == null) continue;

    addEntry(entry);
    folEntries[entry.name] = entry;
  
  }

  const sub = LS_SUB + listName + '_';
  for (let i = 1; i <= sbCnt; i++) {
   
    var entryString = localStorage.getItem(sub + i);
    var entry = loadEntry(entryString);
    if (entry == null) continue;

    addEntry(entry);
    subEntries[entry.name] = entry;
  
  }

}

function deleteStateLocalStorage() {

  flCnt = Number(localStorage.getItem('fol_count'));
  sbCnt = Number(localStorage.getItem('sub_count'));

  for (let i = 1; i <= flCnt; i++)
    localStorage.removeItem('fol_' + i);

  for (let i = 1; i <= sbCnt; i++)
    localStorage.removeItem('sub_' + i);

  localStorage.removeItem('fol_count');
  localStorage.removeItem('sub_count');

}

function clearList() {

  deleteStateLocalStorage();
  // httpPost('antifun.club/api/subapp/delete');
  window.location.reload(false); 

}

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
  
  /*
  var lastListName = localStorage.getItem('last_list_name');
  if (lastListName != null && lastListName === LIST_NAME) {
    // last time we could not save the list data on the server, so we load backup from local storage
    
    loadStateLocalStorage();

  } else {
    // last time server save was sucessful, so we just clear backup data to be ready to take new ones

    deleteStateLocalStorage();

  }
  */
  loadStateLocalStorage();
  localStorage.removeItem('last_list_name');

  // api/subapp/get

}

function loadSubIcons() {
  
  return getTwitchSubBadgesByID(getTwitchUserID(CHANNEL));

}

function init() {

  // init consts
  LIST_NAME = 'default';
  CHANNEL = 'yugybunyg';// readCookie('channel');
  MAX_CHOICE_LENGTH = 60;
  
  // load sub icons to memory
  var tmp = loadSubIcons();
  subIcons = tmp.subIcons;
  subIconsMonths = tmp.months;

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

  // init error handler
  errorField = document.createElement('div');

  errorField.style.position       = 'absolute';
  errorField.style.bottom         = 0;
  errorField.style.right          = 0;
  errorField.style.width          = '200px';
  errorField.style.height         = 'auto';
  errorField.style.display        = 'flex';
  errorField.style.flexDirection  = 'column';
  errorField.style.justifyContent = 'flex-end';
  errorField.style.boxSizing      = 'border-box';
  errorField.style.overflow       = 'hidden';

  errorField.MAX_ERRORS = 4;
  errorField.ERROR_HEIGHT = 600 / errorField.MAX_ERRORS;
  errorField.TTL = 4; // in s
  errorField.errorsCount = 0;

  document.body.appendChild(errorField);

  // init twitch bot
  initTwitchBot(CHANNEL);

  // start server save timer //
  // serverSaveTimer(); // depends on saveInterval

  // defaulty hidding list view
  document.getElementById('listsContainer').style.display = 'none';
  disableSidebar();

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

  // delete later
  displayError('Could not save data! Alert!');

  if (saveInterval < 1) return;
  window.setTimeout(serverSaveTimer, saveInterval * 1000);

  saveNewData();

}

function saveNewData(sync = false) {

  if (isHashEmpty(newFolEntries) && isHashEmpty(newSubEntries)) return;
  
  // send new data to server and empty buffers
  
  jsonBody = '{ user: "' + CHANNEL + '", listName: "' + LIST_NAME + '", requestData: "';
  
  // ? functions ?
  for (fol in newFolEntries) {
    jsonBody += '(\"' + newFolEntries[fol].name + '\", ' + 0 + ', ' + newFolEntries[fol].months + ', \"' + addSlashes(newFolEntries[fol].choice) + '\"), ';
  }

  for (sub in newFolEntries) {
    jsonBody += '(\"' + newFolEntries[sub].name + '\", ' + 1 + ', ' + newFolEntries[sub].months + ', \"' + addSlashes(newFolEntries[sub].choice) + '\"), ';
  }

  jsonBody = jsonBody.substring(0, jsonBody.length - 2); // meh

  jsonBody += '"}';

  header = {};
  header.key = 'token';
  header.value = localStorage.getItem('token');
  
  console.log(jsonBody);

  return; // remove later

  httpPost('api/subapp/save', callback, body, header, sync);
  
  function callback(response) {

    console.log(response);
    if (error) {
      displayError(error.toString());
      
      appendHash(newFolEntries, tmpFol);
      appendHash(newSubEntries, tmpSub);

      localStorage.setItem('last_list_name', LIST_NAME);

    } else {

      localStorage.removeItem('last_list_name');
    
    }

    tmpFol = null;
    tmpSub = null;

  }

  tmpFol = copyHash(newFolEntries);
  tmpSub = copyHash(newSubEntries);

  newFolEntries = {};
  newSubEntries = {};

}

function isHashEmpty(hash) {

  for (x in hash)
    return false;

  return true;

}

function copyHash(hash) {

  var copy = {};

  for (x in hash)
    if (hash.hasOwnProperty(x))
      copy[x] = hash[x];

  return copy;

}

function appendHash(target, source) {

  for (x in target)
    if (source.hasOwnProperty(x))
      if (target[x] == null)
        target[x] = source[x];

}

 function addSlashes(str) {
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

var errorID = 0;
function displayError(errorMessage) {

  console.log('[ERROR] ' + errorMessage);

  var container = document.createElement('div');

  container.style.color           = 'white';
  container.style.backgroundColor = '#FF3333';
  container.style.width           = '100%';
  container.style.height          = '80px';
  container.style.marginTop       = '2px';
  container.style.boxSizing       = 'border-box';
  container.style.padding         = '4%';
  container.style.borderRadius    = '5px';
  container.style.borderWidth     = '2px';
  container.style.borderStyle     = 'solid';
  container.style.borderColor     = 'white';
  container.style.display         = 'flex';
  container.style.flexDirection   = 'row';
  container.style.alignItems      = 'center';
  container.style.justifyContent  = 'start';
  container.style.transition      = 'transform 1s, opacity 0.5s';
  container.style.transform       = 'translateX(200px)';

  var symbol = document.createElement('img');

  symbol.src                = 'Icons/error.svg';
  symbol.style.height       = '50%';
  symbol.style.aspectRatio  = '1 / 1';
  symbol.style.paddingRight = '6%';
  symbol.style.filter       = 'invert(1)';

  var message = document.createElement('div');

  message.style.height = 'auto';
  message.innerHTML = errorMessage + '[' + errorID + ']';
  errorID++;

  if (errorField.errorsCount >= errorField.MAX_ERRORS) {
    
    clearTimeout(errorField.firstChild.ttlTmr);
    errorField.removeChild(errorField.firstChild);
  
  }

  container.appendChild(symbol);
  container.appendChild(message);
  errorField.appendChild(container);

  setTimeout(function() {

    container.style.transform = 'translateX(0px)';

  }, 1);

  errorField.errorsCount++;

  container.ttlTmr = setTimeout(function() {

    container.style.opacity = 0;

    container.ttlTmr = setTimeout(function() {
      errorField.removeChild(container);
      errorField.errorsCount--;
    }, 500);

  }, errorField.TTL * 1000);

}

function addNewList() {

  var newList = createNewList('enter name');

  newList.contentEditable = true;
  newList.focus();

  viewList(newList);

}

function createNewList(name) {

  var newList = document.createElement('div');
  newList.className = 'listsTabsItem';

  newList.name = name;

  newList.command = (lists.length === 0) ? '%' : '%' + lists.length;
  document.getElementById('commandInput').value = newList.command;

  var oldName = name; 
  newList.innerHTML = oldName;

  newList.addEventListener('dblclick', function() {
    
    this.contentEditable = true;
    oldName = this.innerHTML;
    // this.className = 'inEdit';
  
  });

  newList.addEventListener('blur', function() {

    if (this.wasAnAlert) {
      this.wasAnAlert = false;
      return;
    }

    // this.className = 'listsTabsItem';
    var newName = this.innerHTML;
    if (newName == '') {
      
      if (confirm('Wanna delete list?')) {
        removeList(this);
        return;
      }

      this.innerHTML = oldName;
    
    }

    if (!setListName(this, newName)) {
      
      this.wasAnAlert = true;
      alert('Name have to be unique and not contain \'' + PARAM_DELIMITER + '\'!');
      this.focus();

      return;
    
    }

    this.contentEditable = false;
  
  });

  newList.addEventListener('click', function() {

    if (newList != selectedList) {
      viewList(newList);
    }
  
  });

  newList.active = false;
  lists.push(newList);

  var parent = document.getElementById('listsAdder');
  parent.appendChild(newList);

  var range = document.createRange();
  range.selectNodeContents(newList);
  var selection = window.getSelection();
  selection.removeAllRanges(); 
  selection.addRange(range);

  return newList;

}

function removeList(list) {

  listsStr = localStorage.getItem(LS_LISTS);
  listsArr = (listsStr == null || listsStr === '') ? [] : listsStr.split(PARAM_DELIMITER);

  var i;
  for (i = 0; i < listsArr.length; i++) {

    if (listsArr[i] === list.name) {
      listsArr.splice(i, 1);
      break;
    }

  }

  lists.splice(lists.indexOf(list), 1);

  localStorage.setItem(LS_LISTS, listsArr.join(PARAM_DELIMITER));
  
  list.remove();
  if (lists.length === 0) {
    document.getElementById('listsContainer').style.display = 'none';
    disableSidebar();
  }

}

function disableSidebar() {

  document.getElementById('sidebarWrapper').style.display = 'none';

}

function enableSidebar() {

  document.getElementById('sidebarWrapper').style.display = '';

}

function setListName(list, name) {

  for (i = 0; i < lists.length; i++) {
    if (lists[i] != list && lists[i].name === name) return false;
  }

  var oldName = list.name;
  list.name = name;
  saveListName(list, oldName);

  return true;

}

function saveListName(list, oldName = '') {

  listsStr = localStorage.getItem(LS_LISTS);
  listsArr = (listsStr == null) ? [] : listsStr.split(PARAM_DELIMITER);

  var i;
  for (i = 0; i < listsArr.length; i++) {

    if (listsArr[i] === oldName) {
      listsArr[i] = list.name;
      break;
    }

  }

  if (i >= listsArr.length) {
    localStorage.setItem(LS_LISTS, (listsStr == null) ? list.name : listsStr + PARAM_DELIMITER + list.name);
  } else {
    localStorage.setItem(LS_LISTS, listsArr.join(PARAM_DELIMITER));
  }

}

function viewList(list) {

  if (list == null) return;

  document.getElementById('listsContainer').style.display = '';
  document.getElementById('commandInput').value = list.command;

  if (selectedList != null) selectedList.className = 'listsTabsItem';
  list.className = 'listsTabsItemActive';

  selectedList = list;
  loadListData(list);

  // change later
  loadListLocalStorage(list.name);

  enableSidebar();

}

function loadListData(list) {

}

function setCommand(newCommand) {

  selectedList.command = newCommand;

}