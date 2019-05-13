"use strict";

(function () {

    let total = calculateTotal();
    updateRemaining(total);

    /*
    * Reads the page and extracts total course time
    *
    * @return {number} Total course time in seconds
    */
    function calculateTotal() {
        let total = document.querySelectorAll("span[itemprop='timeRequired']");
        if (Array.from(total).length != 0) {
            total = total[0].innerText;
            console.log("Course total time:", total);
            return hmsToSeconds(total);
        }
        return 0;
    };

    /*
    * Reads the page and calculates total remaınıng tıme
    *
    * @return {number} Remaining course time in seconds
    */
    function calculateRemaining() {
        let remaining = 0;
        let videos = document.getElementsByClassName("row video-row");
        videos = Array.from(videos);

        if (videos.length > 0) {
            videos.forEach(function (video) {
                if (!video.children[1].children[0].matches(".eye"))
                    remaining += hmsToSeconds(video.children[0].children[2].innerText);
            });
        }
        return remaining;
    }

    /*
    * Updates the injected remaining info on page
    *
    * * @param {number} total - Total course time in seconds
    */
    function updateRemaining(total) {
        let remaining = calculateRemaining();
        let title = document.getElementsByClassName("col-xs-7 col-sm-9 col-md-6 col-lg-7");
        if (title.length == 0) // Not a course page.
            return;

        let percentage = calculatePercentage(remaining, total);

        let msg = `Total Remaining: ${secondsToHms(remaining)} ${percentage}%`;
        console.log(msg);

        injectMsg(title, msg);
    }

    /*
    * Injects a span with message or updates already injected one
    *
    * @param {Object} title - Document object for injection
    * @param {string} msg - Information to display in the injected span
    */
    function injectMsg(title, msg) {
        let span = document.getElementsByClassName("remaining-time");
        if (span.length == 0) {
            span = document.createElement("span");
            span.className = "remaining-time";
            span.appendChild(document.createTextNode(msg));
            title[0].appendChild(span);
        } else {
            span[0].innerText = msg;
        }
    }

    /*
    * Calculates the percentage from total and remaining
    *
    * @param {number} remaining - Remaining course time in seconds
    * @param {number} total - Total course time in seconds
    * @return {number} The percentage as at most two decimal float
    */
    function calculatePercentage(remaining, total) {
        let percentage = remaining / total * 100;
        if (percentage > 100)
            percentage = 100;
        else if (percentage % 1 !== 0)
            percentage = percentage.toFixed(2);
        return percentage;
    }

    /*
    * Convert seconds to #h #m #s
    *
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
    *
    * @param {string} input - Time in #h #m #s format
    * @return {string} Time in seconds
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
    *
    * @param {string} input - Time param in #h #m #s format
    * @param {string} ch - 'h' or 'm' or 's' 
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
            updateRemaining(total);
        }
    });
})();