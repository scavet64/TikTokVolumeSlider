// ==UserScript==
// @name        TikTok Volume Slider
// @version     3.2.1
// @description A userscript that adds a simple volume slider to the desktop tiktok site to prevent your ears from being destroyed. The volume is stored in local storage so it is remembered between sessions. Also adds video controls to skip stuff
// @namespace   https://github.com/scavet64
// @match       https://www.tiktok.com/*
// @grant       none
// @author      Vincent Scavetta
// @updateURL   https://raw.githubusercontent.com/scavet64/TikTokVolumeSlider/master/TikTokVolumeSlider.user.js
// @downloadURL https://raw.githubusercontent.com/scavet64/TikTokVolumeSlider/master/TikTokVolumeSlider.user.js
// ==/UserScript==

const mainSliderContainer = '.menu-right';
const mainSliderID = 'mainSliderId';

const modalSliderContainer = '.video-infos-container';
const modalSliderID = 'modalSliderId';

const localStorageKey = 'customVolume';

let volumeLevel = getVolume();

/**
 * Alter the HTMLMediaElement.prototype's setter so that it reduces the volume that tiktok is forcing on us.
 * As of 8/16/21, tiktok seems to be forcing a volume of 80% on some kind of consistent loop. This will
 * at least ensure that we can reduce the overall volume to something more reasonable based on the volume slider.
 * Since its being set to 80%, that will be our new 100% for now until it can be looked into more.
 */
const { prototype } = HTMLMediaElement;
const { set: setter, get: getter } = Object.getOwnPropertyDescriptor(prototype, 'volume');
Object.defineProperty(prototype, 'volume', {
  get() {
    return getter.call(this);
  },
  set(arg) {
    let sliderVolume = getVolume();
    let newVolume = arg * sliderVolume;
    console.info(`${arg} transformed to ${newVolume} using slider: ${sliderVolume}`);
    setter.call(this, newVolume);
  }
});

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
        setVideoVolume(volumeLevel);
        saveVolume(volumeLevel);
    }

    return slider;
}

function setVideoVolume(value) {
    var videoHtmlCollection = document.getElementsByTagName('video');
    var video;
    for (var i = 0; i < videoHtmlCollection.length; i++) {
        video = videoHtmlCollection.item(i);
        if (video) {
            video.style.cssText += "z-index: 100"; 
            video.setAttribute("controls","controls");
            video.volume = value;
            video.muted = false;
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
    }, 500);
})();