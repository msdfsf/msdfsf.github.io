function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle('sidebarActive');
    document.getElementById("sidebarBehind").classList.toggle('sidebarBehindActive');
}

function clickToggleSidebar() {
    if (getComputedStyle(document.getElementById("sidebar")).left === "0px") {
        document.getElementById("sidebar").classList.toggle('sidebarActive');
        document.getElementById("sidebarBehind").classList.toggle('sidebarBehindActive');
    }
} 

function changeSub() {
    changeButtonStateAndName(sub, 'Follower', 'Subscriber');
}

function changeSubsOnly() {
    changeButtonState(subsOnly);
    saveButtonState(subsOnly);
}

function changeModAsSub() {
    changeButtonState(modAsSub);
    saveButtonState(modAsSub);
}

function changeVipAsSub() {
    changeButtonState(vipAsSub);
    saveButtonState(vipAsSub);
}

function changeWriteTitle() {
    changeButtonState(writeTitle);
    saveButtonState(writeTitle);
}

function changeDuplicateCheck() {
    changeButtonState(duplicateCheck);
    saveButtonState(duplicateCheck);
}

function changeCollectRequests() {
    changeButtonStateAndName(collectRequests, 'Collect Requests', 'Stop Request Collecting');
    
    if (collectRequests.state) {
        
        activeListsCount++;
        
        if (lists.length > activeListsCount) {

            firstInactive = lists[activeListsCount];
            lists[lists.indexOf(selectedList)] = firstInactive; // indexOf has to be changed, but ok
            lists[activeListsCount] = selectedList;
        
        }
    
    } else {

        activeListsCount--;

    }

    selectedList.isActive = collectRequests.state;

}

function changeButtonState(button) {
    if (button.state) button.state = false;
    else button.state = true;
    document.getElementById(button.id).classList.toggle('buttonOff');
}

function changeButtonStateAndName(button, falseText, trueText) {
    var newText;
    if (button.state) {
        button.state = false;
        newText = falseText;
    }
    else {
        button.state = true;
        newText = trueText;
    }
    document.getElementById(button.id).classList.toggle('buttonOff');
    document.getElementById(button.id).firstChild.data = newText;
}

function saveTextBoxEntry(element) {
    saveTextBoxState(element.id);
}