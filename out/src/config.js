"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLabelsConfig = void 0;
const packageinfo_1 = require("./whatsnew/packageinfo");
/**
 * Returns the current config, i.e. the user preferences.
 * Returns also the rootFolder, but this is not set i.e. ''.
 */
function getLabelsConfig() {
    // Get some settings.
    const settings = packageinfo_1.PackageInfo.getConfiguration();
    let labelsWithColons = true;
    let labelsWithoutColons = true;
    const labelsColon = (settings.get('labels.colon') || '').toLowerCase();
    if (labelsColon.startsWith('without '))
        labelsWithColons = false;
    else if (labelsColon.startsWith('with '))
        labelsWithoutColons = false;
    const labelsExcludesString = settings.get('labels.excludes') || '';
    const labelsExcludes = labelsExcludesString.toLowerCase().split(';');
    const config = {
        rootFolder: '',
        labelsWithColons,
        labelsWithoutColons,
        labelsExcludes
    };
    return config;
}
exports.getLabelsConfig = getLabelsConfig;
//# sourceMappingURL=config.js.map