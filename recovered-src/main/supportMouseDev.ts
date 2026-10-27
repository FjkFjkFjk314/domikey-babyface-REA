import { commonMouseLayout } from "./res/lightLayout/lightMouseLayout/commonMouseLayout"
import { commonMouseOther } from "./res/otherSetting/commonMouseOther"
import { SupportDevType } from "./supportDev"

const kRGBGroup = 'rongyuan_k_rgb'
export const supportMouseDev: SupportDevType[] = [
    {
        id: 923,
        vid: 0x3151,
        pid: 0x400B,
        usage: 0x02,
        usagePage: 0xffff,
        name: 'common_mouse',
        displayName: 'commonMouse',
        support_onboard: 2,
        type: 'mouse',
        group: kRGBGroup,
        featureReportByteLength: 65,
        company: 'LTCFn',
        layout: commonMouseLayout,
        layer: 8,
        fnLayer: 1,
        otherSetting: commonMouseOther,
    },

    {
        id: -11,
        vid: 0x3151,
        pid: 0x400B,
        usage: 0x02,
        usagePage: 0xffff,
        name: 'commonMouse',
        displayName: 'common_mouse',
        support_onboard: 2,
        type: 'mouse',
        group: kRGBGroup,
        featureReportByteLength: 65,
        company: 'LTCFn',
        layout: commonMouseLayout,
        // layer: 3,
        // fnLayer: 1,
        // otherSetting: yc200LEDOtherH135,
    },
]