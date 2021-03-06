const NEW_LINE = /\r?\n/;

function processFile(file, sub) {

  var reader = new FileReader();

  reader.onload = function(e) {

    var content = e.target.result;
    var data = content.split(NEW_LINE);
    for (let i = 0; i < data.length; i++) {

      var tmp = data[i].trim().split(': ');
      if (tmp.length < 2) continue;

      var name = tmp[0];
      var choice = tmp[1];

      takeCareAboutItem(name.toLowerCase(), choice, sub, name, 0);
    
    }
  
  };
  reader.readAsText(file);

}

function processFileByClick(sub) {

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = "text/*";

  input.onchange = () => processFile(input.files[0], sub);
  input.click();

}

function processSubFileByClick() {
  processFileByClick(true);
}

function processFolFileByClick() {
  processFileByClick(false);
}

function dragAndDropFile(event, param, sub) {

  var file = param[0];
  if (!file.type.match("text.*/")) return;
 
  processFile(file, sub);
  event.preventDefault();

}

function dragAndDropSubFile(event, param) {
  dragAndDropFile(event, param, true);
}

function dragAndDropFolFile(event, param) {
  dragAndDropFile(event, param, false);
}

function exportAsCSV() {

  const dataType = "data:text/csv;charset=utf-8,%EF%BB%BF";
  const nL = "\r\n";
  var csv = 'subName, subGame';

  if (folCount > 0) {

    console.log('fol');

    csv += ', folName, folGame';

    var subList = document.getElementById('subList').getElementsByTagName('li');
    var folList = document.getElementById('folList').getElementsByTagName('li');

    const subCount = subList.length;
    const folCount = folList.length;

    if (folCount > subCount) {

      let i;
      for (i = 0; i < subCount; i++) {
        
        subEntry = subList[i].entry;
        folEntry = folList[i].entry;

        csv += nL + subEntry.displayName + ',"' + subEntry.choice + '",' + folEntry.displayName + ',"' + folEntry.choice + '"';
      
      }
      
      for (i = subCount; i < folCount; i++) {
        
        folEntry = folList[i].entry;
        csv += nL + ' ,' + ' ,' + folEntry.displayName + ',"' + folEntry.choice + '"';
      
      }

    } else {

      let i;
      for (i = 0; i < folCount; i++) {

        subEntry = subList[i].entry;
        folEntry = folList[i].entry;

        csv += nL + subEntry.displayName + ',"' + subEntry.choice + '",' + folEntry.displayName + ',"' + folEntry.choice + '"';
      
      }

      for (i = folCount; i < subCount; i++) {
        
        subEntry = subList[i].entry;
        csv += nL + subEntry.displayName + ',"' + subEntry.choice + '", ' + ', ';
      
      }
    
    } 

  } else {

    var subList = document.getElementById('subList').getElementsByTagName('li');
    for (let i = 0; i < subCount; i++) {
      
      subEntry = subList[i].entry;
      csv += nL + subEntry.displayName + ',"' + subEntry.choice + '"';
    
    }

  }

  downloadData(csv, dataType, 'FolSubList.csv');
  
}

function exportSubMarbles() {
	var list = [];
	list = Array.prototype.concat.apply(list, document.getElementById('subList').getElementsByTagName('li'));
	exportAsTXT(list, 'usernames.csv', '', '"', '"');
}

function exportFolMarbles() {
	var list = [];
	list = Array.prototype.concat.apply(list, document.getElementById('folList').getElementsByTagName('li'));
	exportAsTXT(list, 'usernames.csv', '', '"', '"');
}

/*
function exportMarbles() {
	var list = [];
	list = Array.prototype.concat.apply(list, document.getElementById('subList').getElementsByTagName('li'));
	list = Array.prototype.concat.apply(list, document.getElementById('folList').getElementsByTagName('li'));
	exportAsTXT(list, 'usernames.csv', '', '"', '"');
}
*/

function exportSubAsTXT() {

  var subList = document.getElementById('subList').getElementsByTagName('li');
  exportAsTXT(subList, 'SubList.txt');


}

function exportFolAsTXT() {

  var folList = document.getElementById('folList').getElementsByTagName('li');
  exportAsTXT(folList, 'FolList.txt');

}

function exportAsTXT(list, name, del = ': ', leftBound = '', rightBound = '') {

  if (list.length < 1) return;

  const dataType = "data:text/txt;charset=utf-8,%EF%BB%BF";

  var coef = 1;
  if (list[0].entry.tier == 2) coef = TIER_2_COEF;
  else if (list[0].entry.tier == 3) coef = TIER_3_COEF;
  
  var txt = (coef > 0) ? leftBound + list[0].entry.displayName + del + list[0].entry.choice + rightBound : '';
  for (let j = 1; j < coef; j++) {
	  txt += '\r\n' + leftBound + list[0].entry.displayName + del + list[0].entry.choice + rightBound;
  }
  
  for (let i = 1; i < list.length; i++) {
    
    var entry = list[i].entry;
    
    var coef = 1;
    if (entry.tier == 2) coef = TIER_2_COEF;
    else if (entry.tier == 3) coef = TIER_3_COEF;
    
    for (let j = 0; j < coef; j++) {
      txt += '\r\n' + leftBound + entry.displayName + del + entry.choice + rightBound;
    }
  
  }

  downloadData(txt, dataType, name);

}

function downloadData(dataStr, dataType, fileName) {

  var link = document.createElement('a');
  link.setAttribute('href', dataType + encodeURI(dataStr));
  link.setAttribute('download', fileName);
  document.body.appendChild(link);

  link.click();

  link.parentNode.removeChild(link);

}