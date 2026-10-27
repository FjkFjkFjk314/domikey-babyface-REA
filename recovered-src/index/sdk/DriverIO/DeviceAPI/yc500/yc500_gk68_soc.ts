import { YC500Common } from "./yc500Common"
import { defaultMatrix_yc500_gk68_soc } from "./yc500_gk68_socMatrix"
export class YC500_GK68_SOC extends YC500Common {
	defaultMatrix = defaultMatrix_yc500_gk68_soc
	COMMONCOLOR: { [key: number]: number } = {
		0: 0x007FFF,
		1: 0xff0000,
		2: 0x00ff00,
		3: 0x0000ff,
		4: 0xFFA500,
		5: 0x8B00FF,
		6: 0xffff00,
	};
}