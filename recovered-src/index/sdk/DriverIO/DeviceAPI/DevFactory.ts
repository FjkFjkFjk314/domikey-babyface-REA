import { DeviceType } from "../../DB"
import { Dk2017 } from "./dk2017"
import { KeyboardInterface } from "./KeyboardInterface"
import { MouseInterface } from "./MouseInterface"
// import { TestKeyboard } from "./testKeyboard"
// import { TestMouse } from "./testMouse"
import { sleep } from "../../../unitys/timeFunc"
// import { V25s } from "./v25s"
import { kCompany } from "../../../appConfig"
// sonix
import { K68Help } from "./sonix/k68Help"

import { Common } from "./Common"

// yzw
import { YZWCommon } from "./yzw/YZWCommon"
import { YZWHelp } from "./yzw/YZWHelp"

// yc200
import { findSonixDev } from "./findSonixDev"
import { findYZWDev } from "./findYZWDev"
import { findYC300Dev } from "./findYC300Dev"
import { findBK100Dev } from "./findBK100Dev"
import { findYC500Dev } from "./findYC500Dev"
import { findMouseDev } from "./findMouseDev"
import { findYC3016ADev } from "./findYC3016ADev"

import { BKHelp } from "./bk100/bkHelp"




export const CreateDeviceByDeviceType = async (dtemp: DeviceType): Promise<MouseInterface | KeyboardInterface | undefined> => {
    console.log('DDDTTTTEEEMMMMPPP', dtemp, dtemp.name)
    let res1 = await DeviceType.find({ where: { pid: dtemp.pid, vid: dtemp.vid } })

    if (res1 === undefined || res1.length === 0) {
        res1 = await DeviceType.find({ where: { pid: dtemp.pid, vid: 0x0461 } })
        // console.error("EEEEEEEE ", res1)
    }


    if (res1.length === 1 || res1[0].displayName === 'help') {
        switch (dtemp.name) {
            case 'common':
                return new Common(dtemp)
            case 'YZWCommon':
                return new YZWCommon(dtemp)
            case 'help':
                return new K68Help(dtemp)
            case 'helpYZW':
                return new YZWHelp(dtemp)
            case 'helpBK':
                return new BKHelp(dtemp)
            case 'v25s':
            //return new V25s(dtemp)
            case 'dk2017':
                return new Dk2017(dtemp)
            case '小潘鼠标':
            //return new TestMouse(dtemp)
            case 'test_dj':
            //return new TestMouse(dtemp)
            default: {
                console.error("单台设备未处理")
                return undefined
            }
        }
    }

    await sleep(500)

    // const usbDev = new USBDevice(dtemp)

    await sleep(1000)
    let devId: number | bigint | undefined;

    let cout = 0

    const allDevs = await DeviceType.find()
    while (devId === 0 || devId === undefined) {
        await sleep(200)
        devId = dtemp.id
        // const id =300
        // let tt = Buffer.alloc(64)
        // tt[0] = 143
        // tt[1] = id & 0x00FF
        // tt[2] = id >> 8
        // tt[3] = 0
        // tt[4] = 0 | 0b10000000
        // tt[5] = 1
        // tt[6] = 0
        // tt[7] = 112
        // console.log("___________:", tt?.readInt32LE(1), tt[2] << 8 | tt[1]);
        console.log('DDDEEEVVUUUUIIIIDDDD', devId)
        if (!allDevs.some(v => v.id === devId)) {
            devId = 0
        }
        cout++
        if (dtemp.is24 === false) {
            if (cout > 5) {
                break
            }
        }

    }

    if (devId === 0 || devId === undefined) {

        console.log('设备id返回错误', devId)

        return undefined
    }

    const dev = await DeviceType.findOne({
        where: {
            id: devId,
            company: kCompany
        }
    })


    console.log('DDDEEEVVV', dev, devId, dev?.name)

    if (dev === undefined) return undefined
    dev.vid = dtemp.vid
    dev.devAddr = dtemp.devAddr
    dev.venderAddr = dtemp.venderAddr
    dev.is24 = dtemp.is24
    if (dev.otherSetting === undefined || dev.otherSetting === null)
        dev.otherSetting = {}
    dev.isblue = dtemp.isblue

    let tmp = findSonixDev(dev, dev.name)
    if (tmp === undefined) tmp = findYZWDev(dev, dev.name)
    if (tmp === undefined) tmp = findYC300Dev(dev, dev.name)
    if (tmp === undefined) tmp = findYC500Dev(dev, dev.name)
    if (tmp === undefined) tmp = findBK100Dev(dev, dev.name)
    if (tmp === undefined) tmp = findYC3016ADev(dev, dev.name)
    if (tmp === undefined) tmp = findMouseDev(dev, dev.name)
    if (tmp === undefined)
        console.error("未找到对应实现", dev)
    return tmp
}