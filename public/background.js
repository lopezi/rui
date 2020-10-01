
let timerID
let timerTime
let basicKey
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER') {
    timerTime = new Date(request.when)
  } else if (request.cmd === 'GET_TIME') {
    sendResponse({ time: timerTime })
  }else if (request.cmd === 'SET_BASICKEY') {
	basicKey = request.basicKey
	// console.log("background:basicKey: ",basicKey)
  }else if (request.cmd === 'GET_BASICKEY') {
    sendResponse({ basicKey: basicKey })
  }
})


