import { YC500Common } from "./yc500Common";
import { defaultMatrix_yc500_rs2 } from "./yc500_rs2Matrix";

export class YC500_RS2 extends YC500Common {
    defaultMatrix = defaultMatrix_yc500_rs2
    COMMONCOLOR: { [key: number]: number } = {
        0: 0xff0000,
        1: 0x00ff00,
        2: 0x0000ff,
        3: 0x55ffFF,
        4: 0xff5500,
        5: 0x5500ff,
        6: 0xffff00,
        7: 0xffffff,
    };
}