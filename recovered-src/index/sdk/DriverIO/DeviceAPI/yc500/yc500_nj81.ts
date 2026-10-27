import { YC500Common } from "./yc500Common";
import { defaultMatrix_yc500_nj81 } from "./yc500_nj81Matrix";

export class YC500_NJ81 extends YC500Common {
    defaultMatrix = defaultMatrix_yc500_nj81
    COMMONCOLOR: { [key: number]: number } = {
        0: 0xffffff,
        1: 0xff0000,
        2: 0xff5500,
        3: 0xffff00,
        4: 0x00ff00,
        5: 0x55ffff,
        6: 0x0000ff,
        7: 0x5500ff
    };

}