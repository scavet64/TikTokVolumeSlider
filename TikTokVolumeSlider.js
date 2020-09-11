// ==UserScript==
// @name        TikTok Volume Slider
// @version     2.1
// @description A userscript that adds a simple volume slider to the desktop tiktok site to prevent your ears from being destroyed. The volume is stored in local storage so it is remembered between sessions.
// @namespace   https://github.com/scavet64
// @match       https://www.tiktok.com/*
// @grant       none
// @author      Vincent Scavetta
// @updateURL   https://raw.githubusercontent.com/scavet64/TikTokVolumeSlider/master/TikTokVolumeSlider.js
// @downloadURL https://raw.githubusercontent.com/scavet64/TikTokVolumeSlider/master/TikTokVolumeSlider.js
// ==/UserScript==

const mainSliderContainer = '.menu-right';
const mainSliderID = 'mainSliderId';

const modalSliderContainer = '.video-infos-container';
const modalSliderID = 'modalSliderId';

const localStorageKey = 'customVolume';

let volumeLevel = getVolume();

function checkAndCreateModalSlider() {
    // Grab the container that the modal slider will live in.
    var altContentContainer = document.querySelector(modalSliderContainer);
    if (altContentContainer) {
        // Only add if this slider has not been added before
        if (!document.getElementById(modalSliderID)) {
            var slider = buildSlider(modalSliderID);
            altContentContainer.prepend(slider);
        }
    }
}

function checkAndCreateMainSlider() {
    // Grab the container the main slider will live in.
    var contentContainer = document.querySelector(mainSliderContainer);
    if (contentContainer) {
        // Only add if this slider has not been added before
        if (!document.getElementById(mainSliderID)) {
            var slider = buildSlider(mainSliderID);
            contentContainer.prepend(slider);
        }
    }
}

function buildSlider(id) {
    var slider = document.createElement("input");
    slider.id = id;
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = getVolume() * 100;
    slider.onchange = function () {
        volumeLevel = this.value / 100.00;
        setVideoVolume(volume);
        saveVolume(volume);
    }

    return slider;
}

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

function saveVolume(value) {
    localStorage.setItem(localStorageKey, value);
}

function getVolume() {
    var volume = localStorage.getItem(localStorageKey);
    return volume;
}

(function() {
    window.setInterval(function () {
        checkAndCreateModalSlider();
        checkAndCreateMainSlider();
        setVideoVolume(volumeLevel);
    }, 100);
})();