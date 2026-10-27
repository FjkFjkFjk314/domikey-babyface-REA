import { defaultFnMatrix_yc3121_nj98_megnatism, defaultMatrix_yc3121_nj98_megnatism } from "./yc3121_nj98_megnatismMatrix";
import { YC500Common } from "./yc500Common"
export class YC3121_NJ98_Megnatism extends YC500Common {
    defaultMatrix = defaultMatrix_yc3121_nj98_megnatism
    defaultFnMatrix = defaultFnMatrix_yc3121_nj98_megnatism
    COMMONCOLOR: { [key: number]: number } = {
        0: 0xffffff,
        1: 0xff0000,
        2: 0xff5500,
        3: 0xffff00,
        4: 0x00ff00,
        5: 0x55ffFF,
        6: 0x0000ff,
        7: 0x5500ff
    };
}