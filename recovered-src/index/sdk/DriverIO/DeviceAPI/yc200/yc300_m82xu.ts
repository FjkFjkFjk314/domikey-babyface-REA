import { YC200Common } from "./YC200Common";
import { defaultMatrix_yc300_m82xu } from "./yc300_m82xuMatrix";

export class YC300_M82XU extends YC200Common {
    defaultMatrix = defaultMatrix_yc300_m82xu
    DAZZLE = 7;
    NORMAL = 8;
    COMMONCOLOR = {
        0: 0xff0000,//红
        1: 0x00ff00,//绿
        2: 0x0000ff,//蓝
        3: 0xff5500,//橙
        4: 0x5500ff,//紫
        5: 0xffff00,//黄
        6: 0xffffff,
    }
}