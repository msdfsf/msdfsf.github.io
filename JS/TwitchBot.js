function initTwitchBot(channel) {

  var config = {
    options: {
      debug: false
    },
    connection: {
      cluster: "aws",
      reconnect: true,
	  secure: true
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

function getTwitchUserID(username) {
  
  H1 = {};
  H1.key = 'Client-ID';
  H1.value = cfg.CLIENT_ID;

  H2 = {};
  H2.key = 'Accept';
  H2.value = 'application/vnd.twitchtv.v5+json';

  headers = [H1, H2];

  httpGet('https://api.twitch.tv/kraken/users?login=' + username, callback, headers, true);

  var userID = null;
  function callback(response) {

    const json = JSON.parse(response);
    const user = json.users[0];

    if (user != null) {
      userID = user._id;
      return;
    }

  }

  return userID;

}

function getTwitchSubBadgesByID(userID) {

  H1 = {};
  H1.key = 'Client-ID';
  H1.value = cfg.CLIENT_ID;

  H2 = {};
  H2.key = 'Accept';
  H2.value = 'application/vnd.twitchtv.v5+json';

  headers = [H1, H2];

  httpGet('https://api.twitch.tv/kraken/chat/' + userID + '/badges', callback, headers, true);

  var subIcons = null;
  function callback(response) {

    const json = JSON.parse(response);
    const sub = json.subscriber[0];

    if (sub != null) {
      subIcons = sub;
      return;
    }

  }

  return subIcons;

}