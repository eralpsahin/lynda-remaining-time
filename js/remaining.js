"use strict";

(function () {

    let total = calculateTotal();
    let logged = document.getElementById("submenu-login") ? false : true
    if (logged)
        updateRemaining(total);
    else {
        hideRemaining();
    }

    /* 
    * Injects the template div to sidebar
    *
    * @param {string} total - Total course time in #h #m #s format
    */
    function injectTemplate(total) {

        // Create the wrapping row
        let row = document.createElement("div");
        row.className = "row";
        row.style = "margin-top: 20px;";
        row.innerHTML = `<div class="col-xs-5 col-md-4 col-xl-4 inject" id="total-node"><span id="total">${total}</span><h6>Total</h6>
                        </div><div class="col-xs-7 col-md-8 col-xl-8 inject" id="remaining-node"><span id="remaining"></span><h6>Remaining</h6></div>`;

        let sect = document.getElementsByClassName("sidebar-col")[0].children[0];
        let side = sect.children[0];
        sect.insertBefore(row, side);
    }

    /*
    * Updates the injected remaining info on page
    *
    * @param {number} total - Total course time in seconds
    */
    function updateRemaining(total) {
        if (!document.getElementById("remaining")) // Not a course page.
            return;
        let remaining = calculateRemaining();
        let percentage = calculatePercentage(remaining, total);
        let msg = `${secondsToHms(remaining)} ${percentage}%`;
        console.log(`Remaining: ${msg}`);

        // Inject to the span
        document.getElementById("remaining").innerText = msg;
    }

    /*
    * Hides remaining node when not logged in
    */
    function hideRemaining() {
        let remaining = document.getElementById("remaining-node");
        remaining.style.display = "none";
        let total = document.getElementById("total-node");
        total.className = "col-xs-12 col-md-12 col-xl-12 inject";
    }

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

            // Inject the template to sidebar
            injectTemplate(total);

            return hmsToSeconds(total);
        }
        return 0;
    }

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
        let h = Math.floor(input / 3600);
        let m = Math.floor(input % 3600 / 60);
        let s = Math.floor(input % 3600 % 60);

        let hDisplay = h > 0 ? h + "h " : "";
        let mDisplay = m > 0 ? m + "m " : "";
        let sDisplay = s + "s";
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
        if (request.message === 'URL changed.' && logged) { // recalculate remaining time
            updateRemaining(total);
        }
    });
})();