import { DeviceType } from "../../DB/entity/device_type"
import { YC3016A_3098BWHITE_SINGLE_SOC } from "./yc3016a/yc3016a_3098bwhite_single_soc"
import { YC3016A_5075BWHITE_SINGLE_SOC } from "./yc3016a/yc3016a_5075bwhite_single_soc"
import { YC3016A_HF_K1_SINGLE_SOC } from "./yc3016a/yc3016a_hf_k1_single_soc"
import { YC3016A_K81_OFFICE_KB } from "./yc3016a/yc3016a_k81_office_kb"
import { YC3016A_LJ_FD98T } from "./yc3016a/yc3016a_lj_fd98t"
import { YC3016A_LJ_FD98T_NORGB } from "./yc3016a/yc3016a_lj_fd98t_norgb"
import { YC3016A_S100_SINGLE_SOC } from "./yc3016a/yc3016a_s100_single_soc"
import { YC3016A_S68_SINGLE_SOC } from "./yc3016a/yc3016a_s68_single_soc"
import { YC3016A_V82WHITE_SINGLE_SOC } from "./yc3016a/yc3016a_v82white_single_soc"




export const findYC3016ADev = (dev: DeviceType, devName?: string) => {
    switch (devName) {
        case 'yc3016a_lj_fd98t':
            return new YC3016A_LJ_FD98T(dev)
        case 'yc3016a_lj_fd98t_norgb':
            return new YC3016A_LJ_FD98T_NORGB(dev)
        case 'yc3016a_hf_k1_single_soc':
            return new YC3016A_HF_K1_SINGLE_SOC(dev)
        case 'yc3016a_v82white_single_soc':
            return new YC3016A_V82WHITE_SINGLE_SOC(dev)
        case 'yc3016a_s68_single_soc':
            return new YC3016A_S68_SINGLE_SOC(dev)
        case 'yc3016a_s100_single_soc':
            return new YC3016A_S100_SINGLE_SOC(dev)
        case 'yc3016a_3098bwhite_single_soc':
            return new YC3016A_3098BWHITE_SINGLE_SOC(dev)
        case 'yc3016a_5075bwhite_single_soc':
            return new YC3016A_5075BWHITE_SINGLE_SOC(dev)
        case 'yc3016a_k81_office_kb':
            return new YC3016A_K81_OFFICE_KB(dev)
        default:
            return undefined
    }
}