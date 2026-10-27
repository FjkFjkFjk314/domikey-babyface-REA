import { 键鼠布局 } from "../../../res/layout"

export const layoutToPicSize = (layout: 键鼠布局[]) => {
    const max_x = Math.max(...layout.map(v => v.x))
    const maxXKeyArr = layout.filter(v => v.x === max_x)
    const max_w = Math.max(...maxXKeyArr.map(v => v.w))
    const w = max_x + max_w
    const min_y = Math.min(...layout.map(v => v.y))
    const maxYKeyArr = layout.filter(v => v.y === min_y)
    const max_h = Math.max(...maxYKeyArr.map(v => v.h))
    const h = -min_y + max_h
    return { w, h }
}
//画键盘