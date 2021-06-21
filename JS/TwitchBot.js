function initTwitchBot(channel) {

  var config = {
    options: {
      debug: false
    },
    connection: {
      cluster: "aws",
      reconnect: true
    },
    identity: {
      username: "justinfan1488",
      password: ""
    },
    channels: [channel]
  }
  
  var client = new tmi.client(config);
  client.connect();

  client.on('chat', processTwitchChatMessage);

}

function processTwitchChatMessage(channel, user, message, self) {

  // message.startsWith('%');
  if (collectRequests.state) {

    var subMonth = 0;
    if (!(user["badge-info"] === null)) {
      subMonth = user["badge-info"]["subscriber"];
      if (typeof subMonth === 'undefined') subMonth = user["badge-info"]["founder"];
    } 

    var sub = isSub(user);
    if (subsOnly.state && !sub) return;
    
    takeCareAboutItem(
      user.username, 
      message.substr(1), 
      sub, 
      user["display-name"], 
      Number(subMonth)
    );

    // log
    /*
    var d = new Date();
    console.log(
      "[" + d.getHours() + ":" + d.getMinutes() + "] " + 
      subMonth + " " + user["display-name"] + " " + message.substr(1)
    );
    */

  }

}

function isSub(user) {
  if (user["badges"] === null) return false;
  return user["subscriber"] || ((modAsSub.state && user["user-type"] === "mod") || (vipAsSub.state && user['badges']["vip"] === "1"));
}