import { YC500Common } from "./yc500Common"
import { defaultMatrix_yc500_nj98_soc } from "./yc500_nj98_socMatrix"
export class YC500_NJ98_SOC extends YC500Common {
    defaultMatrix = defaultMatrix_yc500_nj98_soc
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