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

  return client;

}

function stopTwitchBot(client) {

  client.disconnect();

}

function processTwitchChatMessage(channel, user, message, self) {

  // message.startsWith('%');
  for (var i = 0; i < activeListsCount; i++) {

    if (message.startsWith(lists[i].command)) {
		
	  // console.log(user);

    var subMonth = 0;
    if (!(user["badge-info"] === null)) {
      subMonth = user["badge-info"]["subscriber"];
      if (typeof subMonth === 'undefined') subMonth = user["badge-info"]["founder"];
    } 

    var sub = isSub(user);
    if (subsOnly.state && !sub) return;
      
	  var tier = (sub) ? getSubTier(user) : 0;
      takeCareAboutItem(
        lists[i],
        user.username, 
        message.substr(lists[i].command.length), 
        sub,
        user["display-name"], 
        Number(subMonth),
		    tier		
      );
    }

  }

}

function isSub(user) {
  if (user["badges"] === null) return false;
  return user["subscriber"] || ((modAsSub.state && user["user-type"] === "mod") || (vipAsSub.state && user['badges']["vip"] === "1"));
}

function getSubTier(user) {
	subStr = user['badges']['subscriber'];
	if (subStr.length < 3) return 1;
	if (subStr[0] === '2') return 2;
	if (subStr[0] === '3') return 3;
}

function getTwitchUserID(username) {
  
  H1 = {};
  H1.key = 'Client-ID';
  H1.value = cfg.CLIENT_ID;

  H2 = {};
  H2.key = 'Authorization';
  H2.value = 'Bearer ' + AUTH_TOKEN;

  headers = [H1, H2];

  var userID = null;
  httpGet('https://api.twitch.tv/helix/users?login=' + username, callback, headers, true);

  function callback(response) {

    const json = JSON.parse(response);
    const user = json.data[0];

    if (user != null) {
      userID = user.id;
      return;
    }

  }

  return userID;

}

// test later for user without subscribers
function getTwitchSubBadgesByID(userID) {
	
	if (!AUTH_TOKEN) return;

  H1 = {};
  H1.key = 'Client-ID';
  H1.value = cfg.CLIENT_ID;

  H2 = {};
  H2.key = 'Accept';
  H2.value = 'application/vnd.twitchtv.v5+json';

  headers = [H1, H2];

  var months = [0];
  var subIcons = ['SubBadges/0.png'];
  httpGet('https://badges.twitch.tv/v1/badges/channels/' + userID + '/display', callback, headers, true);

  function callback(response) {

    const json = JSON.parse(response);
    const sub = json.badge_sets.subscriber.versions;

    const keys = Object.keys(sub);

    for (let i = 0; i < keys.length; i++) {
      
      var numKey = Number(keys[i]);
      if (numKey > 1000) return;
      
      months.push(numKey);
      subIcons.push(sub[keys[i]].image_url_4x);
    
    }

  }

  months[1] = 1;

  ans = {};
  ans.subIcons = subIcons;
  ans.months = months;

  return ans;

}