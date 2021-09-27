// ==UserScript==
// @name        TikTok Volume Slider
// @version     3.2.2
// @description A userscript that adds a simple volume slider to the desktop tiktok site to prevent your ears from being destroyed. The volume is stored in local storage so it is remembered between sessions. Also adds video controls to skip stuff
// @namespace   https://github.com/scavet64
// @match       https://www.tiktok.com/*
// @grant       none
// @author      Vincent Scavetta
// @updateURL   https://raw.githubusercontent.com/scavet64/TikTokVolumeSlider/master/TikTokVolumeSlider.user.js
// @downloadURL https://raw.githubusercontent.com/scavet64/TikTokVolumeSlider/master/TikTokVolumeSlider.user.js
// ==/UserScript==

// Set this to false if you dont want to have the HTML5 video controls to appear. 
const showControls = true;

const mainSliderContainerClassArray = [
    '.tiktok-149t8v1-DivHeaderRightContainer',
    '.menu-right'
]
const modalSliderContainerClassArray = [
    '.tiktok-7l7okx-DivInfoContainer',
    '.video-infos-container'
]

const mainSliderId = 'mainSliderId';
const modalSliderId = 'modalSliderId';

const localStorageKey = 'customVolume';

let volumeLevel = getVolumeFromLocalStorage();

const {
    prototype
} = HTMLMediaElement;
const {
    set: setter,
    get: getter
} = Object.getOwnPropertyDescriptor(prototype, 'volume');

/**
 * Modify the HTMLMediaElement prototype so we can inject our code into the volume property setter.
 * Anytime the volume is modified, this will ensure that the video isnt muted and that the controls 
 * are present if desired.
 */
Object.defineProperty(prototype, 'volume', {
    get() {
        return getter.call(this);
    },
    set(arg) {
        console.info(`Setting volume to ${volumeLevel} using slider`);
        setter.call(this, volumeLevel);

        // Ensure that the video isn't muted when the volume is being set
        this.muted = false;

        // Show the controls for the video if set
        if (showControls) {
            this.style.cssText += "z-index: 100";
            this.setAttribute("controls", "controls");
        }
    }
});

/**
 * Searches the dom for the container with one of the css classes in the array.
 * @param {String[]} classArray Array of css classes.
 * @returns The container matching one of the css classes.
 */
function searchForContainerUsingClasses(classArray) {
    for (var i = 0; i < classArray.length; i++) {
        var container = document.querySelector(classArray[i]);
        if (container) {
            return container;
        }
    }
    return null;
}

/**
 * Checks and creates the slider on the dom if it has not been created before.
 * @param {String[]} sliderContainerClassArray Array of css classes.
 * @param {String} sliderId The ID that the slider will be assigned
 */
function checkAndCreateSlider(sliderContainerClassArray, sliderId) {
    var sliderContainer = searchForContainerUsingClasses(sliderContainerClassArray)
    if (sliderContainer) {
        // Only add if this slider has not been added before
        if (!document.getElementById(sliderId)) {
            var slider = buildSlider(sliderId);
            sliderContainer.prepend(slider);
        }
    }
}

/**
 * Create and setup the slider element.
 * @param {String} id ID of the slider
 * @returns The newly created slider element
 */
function buildSlider(id) {
    var slider = document.createElement("input");
    slider.id = id;
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = volumeLevel * 100;
    slider.oninput = function () {
        volumeLevel = this.value / 100.00;
        setVideoVolume(volumeLevel);
        saveVolumeToLocalStorage(volumeLevel);
    }

    return slider;
}

/**
 * Set the volume of all the videos on the page. Searches the dom for any video elements and sets their volume
 * @param {int} value The video volume. Range must be between 0 and 1.
 */
function setVideoVolume(value) {
    var videoHtmlCollection = document.getElementsByTagName('video');
    var video;
    for (var i = 0; i < videoHtmlCollection.length; i++) {
        video = videoHtmlCollection.item(i);
        if (video) {
            video.volume = value;
        }
    }
}

/**
 * Save the volume to the browsers local storage
 * @param {int} value volume that should be saved
 */
function saveVolumeToLocalStorage(value) {
    localStorage.setItem(localStorageKey, value);
    console.log(`Saving ${value}`);
}

/**
 * Gets the previously saved value from local storage. If no value was found, a default of 50% is returned
 * @returns The saved volume from local storage
 */
function getVolumeFromLocalStorage() {
    var volume = localStorage.getItem(localStorageKey);
    return volume ? volume : 0.5;
}

/**
 * Create a loop to ensure that our sliders are always created
 */
(function () {
    window.setInterval(function () {
        checkAndCreateSlider(mainSliderContainerClassArray, mainSliderId);
        checkAndCreateSlider(modalSliderContainerClassArray, modalSliderId);
    }, 500);
})();