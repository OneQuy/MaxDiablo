// import { ExtractSlotCardFromHTML } from "./ExtractSlotCardFromHTML"

import { Check } from "./Checker";
import { GenerateBuildData } from "./GenerateBuildData";
import { IsParamExist, LogGreen, LogRed } from "./Utils_NodeJS";

// const text = '<div id="d4tools-tooltip-root"><div class="d4tools-tooltip"><div class="d4-tooltip-positioner d4-tooltip-visible d4-tooltip-bottom" style="pointer-events: auto; left: 159px; top: 275.5px;"><div class="d4t-GameTooltip d4t-tip-rare"><div class="d4t-top-right-icon" style="background-image: url(&quot;https://assets-ng.maxroll.gg/d4-tools/images/webp/3235777746.webp&quot;);"></div><div class="d4t-tip-header d4-color-rare"><div class="d4t-title">Mental Crown</div><div class="d4t-sub-title">Rare Helm</div><div class="d4-color-gray">400 Item Power</div></div><div class="d4t-separator d4t-left"></div><div class="d4t-armor">500 Armor</div><ul><li class="d4t-list-affix d4-color-gray">4.5% Cooldown Reduction<span class="d4-color-inactive"> [1.8 - 3.0]%</span></li><li class="d4t-list-affix d4-color-gray">+4.5% Basic Skill Attack Speed <span class="d4-color-inactive"> [2.1 - 4.5]%</span></li><li class="d4t-list-affix d4-color-gray">+2 Ranks of Hydra (Sorcerer Only)<span class="d4-color-inactive"> [1 - 2]</span></li></ul><div class="d4t-socket"><div class="d4t-slot"><div class="d4t-gems-icon" style="background-position: -13em 0em;"></div></div><div class="d4t-effect">2.5% Maximum Life</div></div><div class="d4t-separator"></div></div></div></div></div>'
// console.log(ExtractSlotCardFromHTML(text))

const main = () => {
    if (IsParamExist('export')) {
        const res = GenerateBuildData(IsParamExist('beauty'));

        if (typeof res === 'string')
            LogRed('error: ' + res)
        else
            LogGreen('Success')

    }
    else if (IsParamExist('check')) {
        Check()
    }
}

main()