import { DeviceType } from "../../DB/entity/device_type"
import { CommonMouse } from "./commonMouse"

export const findMouseDev = (dev: DeviceType, devName?: string) => {
    switch (devName) {
        case 'common_mouse':
            return new CommonMouse(dev)
        default:
            return undefined
    }
}