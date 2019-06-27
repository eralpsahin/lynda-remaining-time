"use strict";

(function() {

    restore_options();

    let total = document.getElementById('total-checkbox');
    let remaining = document.getElementById('radio1');
    let completed = document.getElementById('radio2');

    // Saves options to chrome.storage
    function save_options() {
        chrome.storage.sync.set({
            total: total.checked,
            remaining: remaining.checked
        }, function() {
            M.toast({html: 'Settings Updated!', displayLength: 1000})
            update_preview();
        });
    }

    function restore_options() {
        chrome.storage.sync.get({
            total: true,
            remaining: true
        }, function(items) {

            // Set values according to the fetched storage.
            if (items.total) {
                total.checked = true;
            } else {
                total.checked = false;
            }
            if (items.remaining) {
                remaining.checked = true;
            } else {
                completed.checked = true;
            }
            update_preview();
        });
    }

    function update_preview() {

        let total_preview = document.getElementById('total-preview');
        let remaining_preview = document.getElementById('remaining-preview');
        let completed_preview = document.getElementById('completed-preview');
        if (!total.checked) {
            total_preview.style.display = "none";
            remaining_preview.classList.add("single");
            completed_preview.classList.add("single");

        } else {
            total_preview.style.display = "inline-block";
            remaining_preview.classList.remove("single");
            completed_preview.classList.remove("single");
        }

        if (remaining.checked) {
            remaining_preview.style.display = "inline-block";
            completed_preview.style.display = "none";

        } else {
            remaining_preview.style.display = "none";
            completed_preview.style.display = "inline-block";
        }
    }

    document.getElementById('radio1').addEventListener('input',
        save_options);
    document.getElementById('radio2').addEventListener('input',
        save_options);
    document.getElementById('total-checkbox').addEventListener('input',
        save_options);
})();
