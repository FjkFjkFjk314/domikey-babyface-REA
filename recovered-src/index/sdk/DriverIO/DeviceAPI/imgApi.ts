import { Gif, GifFrame, GifUtil } from "gifwrap"
import Jimp from "jimp"
import { num2Rgb, rgb2Hex, rgb2Num, rgb2Rgb565, rgb5652Rgb, rgbToNum } from "../../../unitys/rgbNum"
import * as path from 'path'
import { mobxStore } from "../../../mobxStore/store"
import { res } from "../../../res"
export const getImgStyle = (drawCArr: DrawType[]) => {
    const xArr = new Array<number>()
    const yArr = new Array<number>()

    drawCArr.map(v => {
        if (v.rgb !== 0)
            xArr.push(v.x)

        if (v.rgb !== 0)
            yArr.push(v.y)
    })

    let left = Math.min(...xArr)
    let top = Math.min(...yArr)
    let imgW = Math.max(...xArr) - left + 1 // Index start at 0
    let imgH = Math.max(...yArr) - top + 1
    let imgS: ImgStyle = {
        left: left,
        top: top,
        right: imgW + left,
        bottom: imgH + top,
        // imgW: imgW,
        // imgH: imgH,
        // offsetX: offsetX,
        // offsetY: offsetY,
    }
    if (xArr.length === 0 && yArr.length === 0) {
        imgS = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        }
    }

    return imgS
}

export const pic2DataArr = (drawCArr: DrawType[], kbW: number, kbH: number) => {
    // w128 h64
    const drawArr = new Array<number>()
    drawCArr.map(v => drawArr.push(v.rgb !== 0 ? 1 : 0))

    const nArrkbWArr = new Array<number[]>()
    for (let i = 0; i < kbH; i++) {
        const nArrkbW = drawArr.slice(i * kbW, i * kbW + kbW)
        nArrkbWArr.push(nArrkbW)
    }

    const xyArr = new Array<number>()
    for (let i = 0; i < kbW; i++) {
        for (let j = 0; j < nArrkbWArr.length; j++) {
            xyArr.push(nArrkbWArr[j][i])
        }
    }

    const tmp = new Array<number[]>()
    for (let i = 0; i < kbW; i++) {
        const nArrkbH = xyArr.slice(i * kbH, i * kbH + kbH)
        for (let j = 0; j < nArrkbH.length; j += 8) {
            const nArr8 = nArrkbH.slice(j, j + 8);
            tmp.push(nArr8)
        }
    }

    const dataArr = new Array<number>()
    const len = Math.ceil(kbH / 8)
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < kbW; j++) {
            const tt = tmp[len * j + i]
            // dataArr.push(tt)
            let num = 0
            for (let n = 0; n < tt.length; n++) {
                num += tt[n] << n
            }
            dataArr.push(num)
        }
    }
    return dataArr
}

export const pic2Rgb565Arr = (drawCArr: DrawType[], imgS: ImgStyle) => {
    // console.error(drawCArr.length);

    const drawArr = new Array<number>()
    const w = imgS.right - imgS.left
    const h = imgS.bottom - imgS.top


    drawCArr.map(v => {
        if (v.x >= imgS.left && v.x < imgS.right
            && v.y >= imgS.top && v.y < imgS.bottom) {
            const rgb565 = rgb2Rgb565(v.rgb)
            drawArr.push(rgb565.r5 | rgb565.g6 | rgb565.b5)
        }
    })
    const dataArr = new Array<number>()
    if (drawArr.length === 0) {
        drawCArr.map(v => {
            const rgb565 = rgb2Rgb565(0)
            drawArr.push(rgb565.r5 | rgb565.g6 | rgb565.b5)

        })
        drawArr.map(v => {
            const rgbBuf = Buffer.alloc(2)
            rgbBuf.writeUInt16LE(v)
            dataArr.push(rgbBuf[1])
            dataArr.push(rgbBuf[0])
        })

    } else {
        const nArrkbWArr = new Array<number[]>()
        for (let i = 0; i < h; i++) {
            const nArrkbW = drawArr.slice(i * w, i * w + w)
            nArrkbWArr.push(nArrkbW)
        }


        const xyArr = new Array<number>()
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < nArrkbWArr.length; j++) {
                xyArr.push(nArrkbWArr[j][i])
            }
        }


        xyArr.map(v => {
            const rgbBuf = Buffer.alloc(2)
            rgbBuf.writeUInt16LE(v)
            dataArr.push(rgbBuf[1])
            dataArr.push(rgbBuf[0])
            // rgbBuf.map(rv => dataArr.push(rv))
        })
    }
    return dataArr
    // console.error("xyArr: ", xyArr);

    // const tmp = new Array<number[]>()
    // for (let i = 0; i < w; i++) {
    //     const nArrkbH = xyArr.slice(i * h, i * h + h)
    //     for (let j = 0; j < nArrkbH.length; j += 8) {
    //         const nArr8 = nArrkbH.slice(j, j + 8);
    //         tmp.push(nArr8)
    //     }
    // }

    // const dataArr = new Array<number>()
    // const len = Math.ceil(h / 8)
    // for (let i = 0; i < len; i++) {
    //     for (let j = 0; j < w; j++) {
    //         const tt = tmp[len * j + i]
    //         tt.map(v => {
    //             const rgbBuf = Buffer.alloc(2)
    //             rgbBuf.writeUInt16LE(v)
    //             rgbBuf.map(rv => dataArr.push(rv))
    //         })
    //     }
    // }
    // return dataArr
}

export const pic2Rgb888Arr = (drawCArr: DrawType[], imgS: ImgStyle) => {
    // console.error(drawCArr.length);

    const drawArr = new Array<number>()
    const w = imgS.right - imgS.left
    const h = imgS.bottom - imgS.top


    drawCArr.map(v => {
        if (v.x >= imgS.left && v.x < imgS.right
            && v.y >= imgS.top && v.y < imgS.bottom) {
            drawArr.push(v.rgb)
        }
    })
    const dataArr = new Array<number>()
    if (drawArr.length === 0) {
        drawCArr.map(v => {
            drawArr.push(0)
        })
        drawArr.map(v => {
            const rgb = num2Rgb(v)
            dataArr.push(rgb.r)
            dataArr.push(rgb.g)
            dataArr.push(rgb.b)
        })
    } else {
        const nArrkbWArr = new Array<number[]>()
        for (let i = 0; i < h; i++) {
            const nArrkbW = drawArr.slice(i * w, i * w + w)
            nArrkbWArr.push(nArrkbW)
        }


        const xyArr = new Array<number>()
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < nArrkbWArr.length; j++) {
                xyArr.push(nArrkbWArr[j][i])
            }
        }
        xyArr.map(v => {
            const rgb = num2Rgb(v)
            dataArr.push(rgb.r)
            dataArr.push(rgb.g)
            dataArr.push(rgb.b)
        })
    }


    return dataArr
}
export const layoutAddPicRGB = async (picArr: UserPicItem[], lenna: Jimp, displayName: string) => {
    const isLayoutExit = displayName in res.键鼠坐标
    const deviceLayout = res.键鼠坐标[isLayoutExit ? displayName : 'default'].layout //当前layout
    for (let i = 0; i < deviceLayout.length; i++) {
        const tmp = lenna.clone()
        const key = deviceLayout[i]
        if (key.knob) continue
        const img = tmp.crop(key.x, Math.abs(key.y), key.w, key.h)
        img.resize(1, 1)
        const rgb = Jimp.intToRGBA(img.getPixelColor(0, 0))

        const pic = picArr.find(v => v.hid === key.value && v.index === key.index)
        if (pic !== undefined) {
            pic.rgb = rgbToNum(rgb.r, rgb.g, rgb.b)
        }
    }

    return picArr
}

export const setJimpAuto = (lenna: Jimp, imgW: number, imgH: number, grayscale: boolean = false, kbW: number, kbH: number) => {
    const img = new Jimp(kbW, kbH)
    for (let y = 0; y < kbH; y++) {
        for (let x = 0; x < kbW; x++) {
            img.setPixelColor(0x000000ff, x, y)
        }
    }
    img.greyscale()
        .contrast(1)

    lenna
        .resize(imgW, imgH)

    if (grayscale) {
        lenna.greyscale()
            .contrast(1)
    }

    const deltX = Math.floor((kbW - imgW) / 2)
    const deltY = Math.floor((kbH - imgH) / 2)

    img.composite(lenna, deltX, deltY)

    return img
}

export const drawTypeArr2Str = async (dArr: DrawType[], kbW: number, kbH: number) => {
    const img = new Jimp(kbW, kbH)

    dArr.map(async v => {
        img.setPixelColor(Number(rgb2Hex(v.rgb)), v.x, v.y)
    })

    return await img.getBase64Async(Jimp.MIME_PNG)
}

export const drawTypeArr2Gif = async (arr: Buffer[], frameDelay: number, kbW: number, kbH: number) => {
    mobxStore.toastStore.setGIFState('bussy', 'drawTypeArr2Gif')
    const frames = new Array<GifFrame>()
    const p = path.join(__dirname, '..', 'test.gif')

    for (let i = 0; i < arr.length; i++) {
        const img = await Jimp.read(arr[i])
        const frame = new GifFrame(img.bitmap, { delayCentisecs: frameDelay / 10 })

        frames.push(frame)
    }
    let u = 0
    let a: Gif | undefined
    while (a === undefined && u < 5) {
        try {
            a = await GifUtil.write(p, frames)
        } catch (error: any) {
            const str: string = error.toString()
            if (str.includes('Error: Frame ') && str.includes(' uses more than 256 color indexes')) {
                const index = str.match(/[0-9]+/g)
                if (index === null) {
                    u++
                    console.log('222: ', error);
                    mobxStore.toastStore.setGIFState('idle', 'drawTypeArr2Gif')
                    return undefined
                }

                const num = Number(index[0])
                GifUtil.quantizeDekker(frames[num], 256)
            } else {
                u++
                console.log('111: ', error);
            }
        }
    }
    mobxStore.toastStore.setGIFState('idle', 'drawTypeArr2Gif')
    return a?.buffer
}

export const getImgAutoSize = (img: Jimp, kbW: number, kbH: number) => {
    const w = img.getWidth()
    const h = img.getHeight()

    let cw = 0
    let ch = 0
    if (w < kbW && h < kbH) {
        cw = w
        ch = h
    } else {
        if ((kbW / kbH) < (w / h)) {
            cw = kbW
            ch = Math.ceil(kbW * (h / w))
        } else {
            cw = Math.ceil(kbH * (w / h))
            ch = kbH
        }
    }

    return { cw, ch }
}

export const fbuf2DrawTypeArr = async (buf: Buffer, kbW: number, kbH: number) => {
    const img = new Jimp(kbW, kbH)
    let lenna = new Jimp(kbW, kbH)
    if (buf.length !== 0) {
        lenna = await Jimp.read(buf)
    }

    img.composite(lenna, 0, 0)
    const arr = new Array<DrawType>()
    for (let y = 0; y < kbH; y++) {
        for (let x = 0; x < kbW; x++) {
            const k = Jimp.intToRGBA(img.getPixelColor(x, y))
            arr.push({ x: x, y: y, rgb: rgb2Num(k.r, k.g, k.b) })
        }
    }

    return arr
}

export const drawTypeArr2fbuf = async (arr: DrawType[], kbW: number, kbH: number) => {
    const img = new Jimp(kbW, kbH)
    arr.map(v => {
        img.setPixelColor(Number(rgb2Hex(v.rgb)), v.x, v.y)
    })

    return img.getBufferAsync(Jimp.MIME_PNG)
}


// export const upRGBImgK = (currentLen: number) => {
//     const b = Buffer.alloc(8)
//     b[0] = 0x24
//     b[1] = 0// 当前是第几帧图片
//     b[2] = 1// Total frames
//     b[3] = 0// frames Delay
//     b[4] = 0
//     b[5] = 0
//     b[6] = currentLen
// }

export const UImgData2DrawTypeArr = (data: UImgData, kbW: number, kbH: number) => {
    const imgDataArr = data.imgDataArr
    let t_arr = new Array<DrawType>()
    const len = Math.ceil(kbH / 8)
    for (let i = 0; i < len; i++) {
        let nArrkbW = imgDataArr.slice(i * kbW, i * kbW + kbW)
        for (let j = 0; j < nArrkbW.length; j++) {
            const num = nArrkbW[j]
            // 8bit
            for (let k = 0; k < 8; k++) {
                t_arr.push({
                    x: j,
                    y: k + i * 8,
                    rgb: (num >> k) % 2 === 0 ? 0 : 0xffffff
                })
            }
        }
    }

    let arr = new Array<DrawType>()
    for (let i = 0; i < len; i++) {
        const tmpArr = t_arr.slice(kbW * 8 * i, kbW * 8 * (i + 1))
        // 8bit
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < kbW; x++) {
                arr.push(tmpArr[8 * x + y])
            }
        }
    }

    return arr
}

export const UImgRGBData2DrawTypeArr = (data: UImgRGBData & ImgStyle, isRgb: '16' | '24', kbW: number, kbH: number) => {
    const imgDataArr = data.imgDataArr
    // console.error(data.imgDataArr);

    const count = isRgb === '16'
        ? 2
        : isRgb === '24'
            ? 3
            : 2
    const imgH = data.bottom - data.top
    const left = data.left
    const top = data.top
    const right = data.right
    const bottom = data.bottom

    if (imgDataArr.length % count !== 0) return undefined
    let rgbArr = new Array<number>()
    for (let i = 0; i < imgDataArr.length; i += count) {
        const nArrc = imgDataArr.slice(i, i + count)
        let rgb = 0
        if (count === 2) rgb = rgb5652Rgb(nArrc[0] << 8 | nArrc[1])
        if (count === 3) rgb = rgbToNum(nArrc[0], nArrc[1], nArrc[2])
        rgbArr.push(rgb)
    }
    let arr = new Array<DrawType>()
    for (let y = 0; y < kbH; y++) {
        for (let x = 0; x < kbW; x++) {
            const d = {
                x: x,
                y: y,
                rgb: 0,
            }
            if (x > left - 1 && x < right && y > top - 1 && y < bottom) {
                d.rgb = rgbArr[(x - left) * imgH + (y - top)]
            }
            arr.push(d)
        }
    }
    return arr
}
