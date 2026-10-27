import { YC500Common } from "./yc500Common";
import { defaultMatrix_yc500_nj68 } from "./yc500_nj68Matrix";

export class YC500_NJ68 extends YC500Common {
    defaultMatrix = defaultMatrix_yc500_nj68
    COMMONCOLOR: { [key: number]: number } = {
        0: 0xffffff,
        1: 0xff0000,
        2: 0xff8000,
        3: 0xffff00,
        4: 0x00ff000,
        5: 0x55ffff,
        6: 0x0000ff,
        7: 0x5500ff
    };

}