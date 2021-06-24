function httpGet(url, callback, headers, sync = false) {
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }

    xmlHttp.open('GET', url, !sync);
    
	for (i = 0; i < headers.length; i++) {
        xmlHttp.setRequestHeader(headers[i].key, headers[i].value);
    }
	
	xmlHttp.send(null);

}

function httpPost(url, callback, headers, body, sync = false) {
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }

    xmlHttp.open('POST', url, !sync);
    
	for (i = 0; i < headers.length; i++) {
        xmlHttp.setRequestHeader(headers[i].key, headers[i].value);
    }
	
	xmlHttp.send(null);

}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function readCookie(key) {
  
    console.log(document.cookie)

}