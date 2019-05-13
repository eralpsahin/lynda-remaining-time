"use strict";

let total = calculateTotal();
calculateRemaining();
function calculateTotal() {
    let total = document.querySelectorAll("span[itemprop='timeRequired']");
    if (Array.from(total).length != 0) {
        total = total[0].innerText;
        console.log("Course total time:", total);
        return hmsToSeconds(total);
    }
    return 0;
};

function calculateRemaining() {
    let remaining = 0;
    let videos = document.getElementsByClassName("row video-row");
    videos = Array.from(videos);
    if (videos.length == 0)
        return;
    videos.forEach(function (video) {
        if (!video.children[1].children[0].matches(".eye")) {
            // The video is not watched, add duration to remaining
            remaining += hmsToSeconds(video.children[0].children[2].innerText);
        } else {
            // TODO: add to done
        }
    });
    let percentage = remaining / total * 100;
    if (percentage > 100)
        percentage = 100;
    else if (percentage % 1 !== 0)
        percentage = percentage.toFixed(2);
    console.log("Total Remaining:", secondsToHms(remaining), `${percentage}%`);
    let span = document.createElement("span");
    span.appendChild(document.createTextNode(`Total Remaining: ${secondsToHms(remaining)} ${percentage}%`));
    let title = document.getElementsByClassName("col-xs-7 col-sm-9 col-md-6 col-lg-7");
    title[0].appendChild(span);
}


/*
* Convert seconds to #h #m #s
* @param {number} input - Time in seconds
* @return {string} Time in #h #m #s format
*/
function secondsToHms(input) {
    input = Number(input);
    var h = Math.floor(input / 3600);
    var m = Math.floor(input % 3600 / 60);
    var s = Math.floor(input % 3600 % 60);

    var hDisplay = h > 0 ? h + "h " : "";
    var mDisplay = m > 0 ? m + "m " : "";
    var sDisplay = s + "s";
    return hDisplay + mDisplay + sDisplay;
}


/*
* Convert #h #m #s to seconds
* @param {string} input - Time param in #h #m #s format
* @return {string} Total time in seconds
*/
function hmsToSeconds(input) {
    let sec = 0;

    let hour = slicePart(input, "h", 3600);
    sec += hour;
    if (hour > 0)
        input = input.substring(input.indexOf(' ') + 1);

    let minute = slicePart(input, "m", 60);
    sec += minute;
    if (minute > 0)
        input = input.substring(input.indexOf(' ') + 1);

    let second = slicePart(input, "s", 1);
    sec += second;
    return sec;
}

/*
* Slice the time from the input
* @param {string} input     - Time param in #h #m #s format
* @param {string} ch        - 'h' or 'm' or 's' 
* @return {number} Hour or Minute in seconds
*/
function slicePart(input, ch) {
    let index = input.indexOf(ch);
    if (index > 0) {
        let val = parseInt(input.substring(0, index));
        if (ch === 'h') {
            val *= 3600;
        } else if (ch === 'm') {
            val *= 60;
        }
        return val;
    }
    else
        return 0;
}

chrome.runtime.onMessage.addListener(function
    (request, sender, sendResponse) {
    if (request.message === 'URL changed.') { // recalculate remaining time
        calculateRemaining();
    }
});