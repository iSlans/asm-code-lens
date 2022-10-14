"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonateInfoInner = void 0;
/**
 * These are the inner functions.
 * I.e. the functions that can be unit tested.
 * I.e. without 'vscode'.
 *
 * Use this.enableDonationInfo = false to disable the DonationInfo nag screen.
 */
class DonateInfoInner {
    /**
     * This function is used to display the donation info message.
     * Will be overwritten with vscode.window.showErrorMessage.
     * @param message The text to show.
     * @param items The items to choose from.
     */
    static showInfoMessage(message, ...items) {
        return __awaiter(this, void 0, void 0, function* () {
            // Overwrite
            return '';
        });
    }
    /**
     * Opens a webview with donation information.
     */
    static openDonateWebView() {
        // Overwrite
    }
    /**
     * Normally returns Date.now().
     * But can be overwritten for unit tests.
     */
    static now() {
        return Date.now();
    }
    /**
     * Returns the previous version, normally from GlobalStorage
     * but here in a function to override for the unit tests.
     * @returns E.g. "2.3.5"
     */
    static getPreviousVersion() {
        // Override
        return '';
    }
    /**
     * Returns the current version, normally from PackageInfo
     * but here in a function to override for the unit tests.
     * @returns E.g. "2.3.5"
     */
    static getCurrentVersion() {
        // Override
        return '';
    }
    /**
     * @returns The donation time. Normally from GlobalStorage but also used by unit tests.
     */
    static getDonationTime() {
        // Override
        return undefined;
    }
    /**
     * Sets the donation time until when the nag screen will be shown.
     * Should be 14 days into the future after new version ahs been installed.
     * @param _time After this time the nag screen is not shown anymore. E.g Date.now() + 14 days.
     */
    static setDonationTime(_time) {
        // Override
    }
    /**
     * Override for unit tests or by real 'get' function.
     * @returns Returns the state of the 'donated' flag in the asm-code-lens preferences.
     */
    static getDonatedPref() {
        // Override
        return false;
    }
    /**
     * Checks the version number.
     * If a new (different) version has been installed the donation time is set to undefined.
     * (To start a new timing.)
     * Is called at the start of the extension (before checkDonateInfo).
     */
    static checkVersion() {
        // Load data from extension storage
        const previousVersion = this.getPreviousVersion();
        const currentVersion = this.getCurrentVersion();
        // Check if version changed: "major", "minor" and "patch"
        if (currentVersion != previousVersion) {
            // Yes, remove the previous donate time
            this.setDonationTime(undefined);
        }
        // Check if already donated
        this.donatedPreferencesChanged();
    }
    /**
     * Called if user changed the 'donated' preferences.
     * If donated then 'evaluateDonateTime' is set to undefined which stops nagging.
     * If not donated 'evaluateDonateTime' is set to current time.
     */
    static donatedPreferencesChanged() {
        // Check if donated
        const donated = this.getDonatedPref();
        this.evaluateDonateTime = donated ? undefined : this.now();
    }
    /**
     * Is called from a location that is frequently used.
     * E.g. the code lenses.
     * It checks if there is time (and other conditions) to show the
     * donate nag screen.
     */
    static checkDonateInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.enableDonationInfo) {
                // Check if enabled
                if (this.evaluateDonateTime != undefined &&
                    this.now() >= this.evaluateDonateTime) {
                    // Evaluate only once per day or activation.
                    this.evaluateDonateTime = this.now() + this.daysInMs(1);
                    // Check if time already set
                    if (this.donateEndTime == undefined) {
                        this.donateEndTime = this.getDonationTime();
                        if (this.donateEndTime == undefined) {
                            this.donateEndTime = this.now() + this.daysInMs(14);
                            this.setDonationTime(this.donateEndTime);
                        }
                    }
                    if (this.now() < this.donateEndTime) {
                        // Time not elapsed yet.
                        // Show info as error text (warning and info text goes away by itself after a short timeout)
                        const selected = yield this.showInfoMessage("If you use 'ASM Code Lens' regularly please support the project. Every little donation helps keeping the project running.", "Yes, please. I want to show my support.", "Not now");
                        if (selected === null || selected === void 0 ? void 0 : selected.toLowerCase().startsWith('yes')) {
                            // Re-direct to donation page
                            this.openDonateWebView();
                        }
                    }
                    else {
                        // Stop evaluating.
                        this.evaluateDonateTime = undefined;
                    }
                }
            }
        });
    }
    /**
     * Returns the number of days in ms.
     */
    static daysInMs(days) {
        /* For testing purposes:
        if (days == 1)
            return 1000 * 10 * 60; // 10 mins
        else
            return 1000 * 60 * 60;	// 1 hour
        */
        return days * 24 * 60 * 60 * 1000;
    }
}
exports.DonateInfoInner = DonateInfoInner;
// To disable the DonationInfo set this to false.
DonateInfoInner.enableDonationInfo = true;
// Will be set to false if the donate info was shown once.
DonateInfoInner.evaluateDonateTime = undefined;
// The time until when the donation info will be shown
DonateInfoInner.donateEndTime = undefined;
//# sourceMappingURL=donateinfoinner.js.map