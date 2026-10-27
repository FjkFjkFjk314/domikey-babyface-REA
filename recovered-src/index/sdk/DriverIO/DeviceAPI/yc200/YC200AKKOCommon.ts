import { defaultMatrix_yzw_5108 } from "../yzw/yzw_5108Matrix";
import { YC200Common } from "./YC200Common";
export class YC200AKKOCommon extends YC200Common {
    defaultMatrix = defaultMatrix_yzw_5108
    DAZZLE = 7;
    NORMAL = 8;
    COMMONCOLOR: { [key: number]: number } = {
        0: 0xff0000,
        1: 0x00ff00,
        2: 0x0000ff,
        3: 0xff5500,
        4: 0x7700ff,
        5: 0xffff00,
        6: 0xffffff,
    };
}