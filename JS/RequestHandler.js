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

function getUrlParam(name, url = window.location.href) {

    var startIdx = url.indexOf('?') + 1;
    for (i = startIdx; i < url.length; i++) {

        if (url[i] === '=') {

            var paramName = url.substring(startIdx, i);
            if (paramName === name) {
                
                startIdx = i + 1;
                for (j = startIdx; j < url.length; j++) {
                    if (url[j] === '&') {
                        return url.substring(startIdx, j);
                    }
                }

                if (j === url.length) {
                    return url.substring(startIdx, j);
                }

                return null;

            }

            for (j = i + 1; j < url.length; j++) {
                if (url[j] === '&') {
                    i = j + 1;
                    startIdx = i;
                    break;
                }
            }
        
        }

    }

    return null;

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