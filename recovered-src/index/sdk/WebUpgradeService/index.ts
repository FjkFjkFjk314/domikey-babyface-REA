import AdmZip from "adm-zip";
import axios, { AxiosResponse } from "axios";
import { appPath, kCompany } from "../../appConfig";
import * as path from 'path'
import * as fs from 'fs'
import zlib from 'zlib'
import child_process from 'child_process'
import { mobxStore } from "../../mobxStore/store";
import { ab2Buf } from "../../unitys/ab2buf";


// export const server_path = 'http://192.168.1.87:3819/api/v2'
// const down_path = 'http://192.168.1.87:3819/download'
export const server_path = 'https://api2.rongyuan.tech:3816/api/v2'
const down_path = 'https://api2.rongyuan.tech:3816/download'
export type ReturnUpgradeMSG<T = {}> =
    | {
        errCode: 0 //0是成功
        data: T
        response?: AxiosResponse<any>
    }
    | {
        errCode: -1
        errMsg: string
        response?: AxiosResponse<any>
    }
const httpClient = async <T>(
    url: string,
    data?: any
): Promise<ReturnUpgradeMSG<T>> => {
    // const session = await getSession()

    // const localCookie = session === undefined ? '' : session.session
    //console.log(JSON.stringify(data))
    console.log("httpClient: ", server_path + url, data);
    try {
        const res = await axios.post(
            server_path + url,
            data,
            {
                // cookie: localCookie,
                timeout: 8000,
            }
        )
        console.log(res)
        if (res.data.code !== 0)
            return {
                errCode: -1,
                errMsg: res.data.err_message,
                response: res
            }

        return {
            errCode: res.data.code,
            ...res.data,
            res
        }
    } catch (error: any) {
        console.log('EEERRRROOORRRR', error.toJSON())
        if (error.response) {
            return {
                errCode: -1,
                errMsg: error.response.data.toString(),
                response: error.response
            }
        } else {
            return {
                errCode: -1,
                errMsg: '网络连接失败',
            }
        }
    }
}
export const httpDownload = async (
    url: string,
): Promise<ReturnUpgradeMSG<Buffer>> => {
    const p = down_path + url
    console.log("ppp: ", p);

    try {
        const res = await axios.get(p, {
            // timeout: 8000,
            responseType: 'arraybuffer'
        })
        console.log(res)
        if (res === undefined)
            return {
                errCode: -1,
                errMsg: 'x',
                response: res
            }

        return {
            errCode: 0,
            data: res.data,
            response: res
        }
    } catch (error: any) {
        try {
            console.log('EEERRRROOORRRR', error.toJSON())
            if (error.response) {
                return {
                    errCode: -1,
                    errMsg: error.response.data.toString(),
                    response: error.response
                }
            } else {
                console.log('EEE: ', error);
                return {
                    errCode: -1,
                    errMsg: '网络连接失败',
                }
            }
        } catch (e) {
            console.log('EEERRRROOORRRREEE: ', error);
            console.log('EEEDDD: ', e);
            return {
                errCode: -1,
                errMsg: error.toString(),
            }
        }
    }
}
export namespace webUpgradeService {

    export type VersionType = {
        id: number
        company: string
        version_str: string

        description: string
        file_path: string
        create_at: {
            secs_since_epoch: number
            nanos_since_epoch: number
        }
        update_at: {
            secs_since_epoch: number
            nanos_since_epoch: number
        }
    }

    export type FwType = VersionType & {
        dev_id: number
        lowest_app_version_str: string
    }
    export type AppType = VersionType & {
        lowest_version_str: string
        iot_driver_version_str: string
    }

    export type IotType = {
        iot_driver_version_str: string,
        description: string,
        file_path: string,
        sys_type: 'win' | 'mac',
        create_at: {
            secs_since_epoch: number
            nanos_since_epoch: number
        }
    }
    export type OledType = VersionType & {
        dev_id: number
        lowest_app_version_str: string
    }

    export const getAppVersion = async () => {
        const res = await httpClient<AppType>('/get_app_version', {
            company: kCompany
        })
        return res
    }

    export const getFwVersion = async (dev_id: number) => {
        const res = await httpClient<FwType>('/get_fw_version', {
            dev_id: dev_id
        })
        return res
    }

    export const getIotVersion = async (sys_type: 'win' | 'mac') => {
        const res = await httpClient<IotType>('/get_iot_version', {
            sys_type: sys_type
        })
        return res
    }


    export const downloadAppUpgradeFile = async (file_path: string, progress: (p: number) => void) => {
        const res = await httpDownload('/' + encodeURI(file_path))

        if (res.errCode !== 0) return
        const zip = new AdmZip(res.data)
        var zipEntries = zip.getEntries()
        zipEntries.forEach((v, i) => {
            console.log('vvvv', v.entryName, path.join(__dirname, '..', 'company', 'company_' + kCompany, v.entryName))
            console.error(i / zipEntries.length);
            progress(i / zipEntries.length)
            if (v.entryName !== 'dist.zip') {
                zip.extractEntryTo(v.entryName, path.join(__dirname, '..', 'company', 'company_' + kCompany), true, true)

                return
            }
            zip.extractEntryTo(v.entryName, __dirname, false, true)
            console.log('dist.zip  :::: path ====   ', path.join(__dirname, 'dist.zip'))
            const zipdist = new AdmZip(path.join(__dirname, 'dist.zip'))
            var zipdistEntries = zipdist.getEntries()
            zipdistEntries.forEach((p, j) => {
                if (p.entryName === 'dist/' || p.entryName.includes('_MACOSX/')) {
                    return
                }
                if (p.entryName.includes('.dll')) {

                    zipdist.extractEntryTo(p.entryName, path.join(appPath(), 'dll'), false, true)
                    return
                }
                console.log('dddiissstttt', p.entryName)
                zipdist.extractEntryTo(/*entry name*/p.entryName, /*target path*/__dirname, /*maintainEntryPath*/false, /*overwrite*/true);
            })
        })

        progress(1)
    }

    export const downloadDevUpgradeFile = async (file_path: string) => {
        const res = await httpDownload('/' + file_path)
        if (res.errCode !== 0) return
        let devres: Buffer = Buffer.alloc(0)
        let fwVersion = await mobxStore.upgradeStore.getFwVersion()
        if (fwVersion != undefined) {
            const splitVersion = fwVersion.version_str.indexOf("_")
            if (splitVersion !== -1) {
                const zip = new AdmZip(res.data)
                var zipEntries = zip.getEntries()

                zipEntries.forEach((v, i) => {
                    const fileName = v.entryName.toLocaleLowerCase().includes('oled')
                    if (!fileName) {
                        devres = v.getData()
                        console.log(v.entryName, '--------', devres);
                    }
                })
            } else {
                devres = zlib.inflateRawSync(res.data)
            }
        }
        return devres

    }

    const fwFile = 'firmwareFile.bin'
    const fwOledFile = 'firmwareOledFile.bin'
    const fwMledFile = 'firmwareMledFile.bin'
    export const downloadOledUpgradeFile = async (file: FwType) => {
        const res = await httpDownload('/' + file.file_path)
        let fw: Buffer | undefined = Buffer.alloc(0)
        let fwOled: Buffer | undefined = Buffer.alloc(0)
        let fwMled: Buffer | undefined = Buffer.alloc(0)
        if (res.errCode !== 0) return { fw, fwOled, fwMled }
        const splitVersion = file.version_str.match(/[^_]+/ig)
        if (splitVersion !== null && splitVersion.length > 1) {
            const zip = new AdmZip(ab2Buf(res.data))
            const zipEntries = zip.getEntries()
            zipEntries.forEach(v => {
                if (v.entryName.includes(fwFile)) fw = v.getData()
                if (v.entryName.includes(fwOledFile)) fwOled = v.getData()
                if (v.entryName.includes(fwMledFile)) fwMled = v.getData()
            })
        } else {
            fw = zlib.inflateRawSync(ab2Buf(res.data))
            fwOled = undefined
            fwMled = undefined
        }

        return { fw, fwOled, fwMled }

    }

    export const downloadIotFile = async (iot_type: IotType, sys_type: 'win' | 'mac') => {
        const res = await httpDownload('/' + encodeURI(iot_type.file_path))
        if (res.errCode !== 0) return
        const iot = sys_type === 'mac' ? 'iot_driver' : 'iot_driver.exe'
        const p = path.join(__dirname, '..', iot)
        const data = zlib.inflateRawSync(res.data)
        // const  data = res.data
        try {
            if (fs.existsSync(p))
                fs.unlinkSync(p)
            fs.writeFileSync(p, data)
            if (process.platform === 'darwin') {
                console.error('chmod 755 ' + '\"' + p + '\"');
                const t = child_process.execSync('chmod 755 ' + '\"' + p + '\"')
                console.error("tt: ", t);
            }
        } catch (e) {
            console.error("eeeeee: ", e);
        }

        // 修改iot版本
        const indexJS_p = path.join(__dirname, '..', 'dist', 'index.js')
        const indexJS = fs.readFileSync(indexJS_p).toString()
        let tstr1: string
        let tstr2: string
        tstr1 = 'SDKVersion:\"'
        tstr2 = '\",BaseAppVersion'
        const index1 = indexJS.indexOf(tstr1)
        const index2 = indexJS.indexOf(tstr2)
        if (index1 === -1 || index2 === -1) return
        const s1 = indexJS.slice(0, index1 + tstr1.length)
        const s2 = indexJS.slice(index2, indexJS.length)
        const str = s1 + iot_type.iot_driver_version_str + s2
        fs.writeFileSync(indexJS_p, str)
    }
}