import { YC500Common } from "./yc500Common"
import { defaultMatrix_yc500_b81_soc } from "./yc500_b81_socMatrix"
export class YC500_B81_SOC extends YC500Common {
  defaultMatrix = defaultMatrix_yc500_b81_soc
  COMMONCOLOR: { [key: number]: number } = {
    0: 0xff0000,
    1: 0xff8000,
    2: 0xffff00,
    3: 0x00ff00,
    4: 0x00ffff,
    5: 0x0000ff,
    6: 0xff00ff,
    7: 0xffffff,//白色
  };
}