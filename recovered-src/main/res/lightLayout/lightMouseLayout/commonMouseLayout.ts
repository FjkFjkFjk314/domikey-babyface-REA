import { Layout } from '../../../supportDev'

export const commonMouseLayout: Layout = {
    light: {
        isRgb: true,
        types: [
            {
                type: 'LightAlwaysOn',
                maxValue: 4,
                minValue: 0,
                rgb: true,
                dazzle: true
            },
            {
                type: 'LightBreath',
                maxValue: 4,
                minValue: 0,
                maxSpeed: 4,
                minSpeed: 0,
                rgb: true,
                dazzle: true
            },
            {
                type: 'LightWave',
                maxValue: 4,
                minValue: 0,
                maxSpeed: 4,
                minSpeed: 0,
                options: ['right', 'left', 'down', 'up'],
                rgb: true,
                dazzle: true
            },
            {
                type: 'LightNeon',
                maxValue: 4,
                minValue: 0,
                maxSpeed: 4,
                minSpeed: 0,
            },
            {
                type: 'LightDazzing',
                maxValue: 4,
                minValue: 0,
                maxSpeed: 4,
                minSpeed: 0,
                rgb: true,
                dazzle: true
            },
            {
                type: 'LightLaser',
                maxValue: 4,
                minValue: 0,
                maxSpeed: 4,
                minSpeed: 0,
                rgb: true,
                dazzle: true
            },
            {
                type: 'LightMusicFollow',
                maxValue: 4,
                minValue: 0,
                options: ['upright', 'separate', 'intersect'],
                rgb: true,
                dazzle: true
            },
            {
                type: 'LightMusicFollow2',
                maxValue: 4,
                minValue: 0,
                options: ['upright', 'separate', 'intersect'],
                rgb: true,
                dazzle: true
            },
            {
                type: 'LightScreenColor',
            },
        ]
    },
    dpi: {
        count: 8,
        max: 12400,
        min: 200,
        delt: 1,
    },
    reportRate: [125, 250, 500, 1000]
}