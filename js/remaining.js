'use strict';

(function() {
  let total = calculateTotal();
  let logged = document.getElementById('submenu-login') ? false : true;

  injectOptionsButton();

  refreshWidget();

  /*
   * Get extension options and refresh the widgets.
   *
   */
  function refreshWidget() {
    chrome.storage.sync.get(
      {
        total: true,
        remaining: true
      },
      function(items) {
        if (!items.total) {
          // Hide Total widget
          let totalEl = document.getElementById('total-node');
          let remainingEl = document.getElementById('remaining-node');
          totalEl.className = 'hidden';
          remainingEl.className = 'col-xs-12 inject';
        }
        if (logged) {
          updateRemaining(total, items);
        } else {
          hideRemaining();
        }
      }
    );
  }

  /*
   * Injects the options button to titlebar.
   *
   */
  function injectOptionsButton() {
    let button = document.createElement('li');
    button.title = 'Lynda Remaining Time';
    button.className = 'class="submenu-toggle-cont popover-trigger"';
    button.innerHTML = `<button id="lynda-remaining-options" class="btn btn-navigation top-menu-item submenu-toggle">
            <span class="account-name" id="option-label">LRT Options</span>
            <i class="lyndacon player-settings hidden-xs hidden-sm"></i></button>`;

    // Inject options for both logged in and out users.
    let links =
      document.getElementById('submenu-profile') ||
      document.getElementById('submenu-login');

    if (!links) return; // Login page does not have link to inject

    links.insertBefore(button, links.firstChild);

    // Listen to options button and redirect user
    document
      .getElementById('lynda-remaining-options')
      .addEventListener('click', function() {
        chrome.runtime.sendMessage({
          message: 'Options clicked.'
        });
      });
  }

  // Listen URL change message for updating the widget
  chrome.runtime.onMessage.addListener(function(request) {
    if (request.message === 'URL changed.' && logged) {
      // recalculate remaining time
      refreshWidget();
    }
  });

  /*
   * Injects the template div to sidebar
   *
   * @param {string} total - Total course time in #h #m #s format
   */
  function injectTemplate(total) {
    // Create the wrapping row
    let row = document.createElement('div');
    row.className = 'row';
    row.style = 'margin-top: 20px;';
    row.innerHTML = `<div id="total-node" class="col-xs-5 col-md-4 col-xl-4 inject" id="total-node"><span id="total">${total}</span><h6>Total</h6>
                        </div><div class="col-xs-7 col-md-8 col-xl-8 inject" id="remaining-node"><span id="remaining"></span><h6 id="remaining-title">Remaining</h6></div>`;

    let sect = document.getElementsByClassName('sidebar-col')[0].children[0];
    let side = sect.children[0];
    sect.insertBefore(row, side);
  }

  /*
   * Updates the injected remaining info on page
   *
   * @param {number} total - Total course time in seconds
   */
  function updateRemaining(total, options) {
    if (!document.getElementById('remaining'))
      // Not a course page.
      return;
    let remaining = calculateRemaining(options.remaining);
    let percentage = calculatePercentage(remaining, total);
    let msg = `${secondsToHms(remaining)} ${percentage}%`;
    let title = options.remaining ? 'Remaining' : 'Completed';

    // Inject title for the second widget
    let titleEl = document.getElementById('remaining-title');
    titleEl.innerText = title;

    // Inject the time information
    document.getElementById('remaining').innerText = msg;
  }

  /*
   * Hides remaining node when not logged in
   */
  function hideRemaining() {
    let remaining = document.getElementById('remaining-node');
    if (!remaining) return;
    remaining.style.display = 'none';
    let total = document.getElementById('total-node');
    total.className = 'col-xs-12 col-md-12 col-xl-12 inject';
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
  function calculateRemaining(isRemaining) {
    let sum = 0;
    let videos = document.getElementsByClassName('row video-row');
    videos = Array.from(videos);

    if (videos.length > 0) {
      videos.forEach(function(video) {
        if (isRemaining && !video.children[1].children[0].matches('.eye'))
          sum += hmsToSeconds(video.children[0].children[2].innerText);
        if (!isRemaining && video.children[1].children[0].matches('.eye'))
          sum += hmsToSeconds(video.children[0].children[2].innerText);
      });
    }
    return sum;
  }

  /*
   * Calculates the percentage from total and remaining
   *
   * @param {number} remaining - Remaining course time in seconds
   * @param {number} total - Total course time in seconds
   * @return {number} The percentage as at most two decimal float
   */
  function calculatePercentage(remaining, total) {
    let percentage = (remaining / total) * 100;
    if (percentage > 100) percentage = 100;
    else if (percentage % 1 !== 0) percentage = percentage.toFixed(2);
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
    let m = Math.floor((input % 3600) / 60);
    let s = Math.floor((input % 3600) % 60);

    let hDisplay = h > 0 ? h + 'h ' : '';
    let mDisplay = m > 0 ? m + 'm ' : '';
    let sDisplay = s + 's';
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

    let hour = slicePart(input, 'h', 3600);
    sec += hour;
    if (hour > 0) input = input.substring(input.indexOf(' ') + 1);

    let minute = slicePart(input, 'm', 60);
    sec += minute;
    if (minute > 0) input = input.substring(input.indexOf(' ') + 1);

    let second = slicePart(input, 's', 1);
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
    } else return 0;
  }
})();
