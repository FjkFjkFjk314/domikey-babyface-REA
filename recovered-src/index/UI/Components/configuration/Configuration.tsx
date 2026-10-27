import React, { Fragment } from 'react'
import { ConfigurationBox } from './ConfigurationBox'

import { dj } from '../../../dj'
import { res } from '../../../res'
import { store } from '../../store'

import { useStore } from '../../../mobxStore/store'
import { useObserver } from 'mobx-react-lite'

import { OutsideAlerter } from '../../utils/OutsideAlerter'
import { newConfigName } from '../../utils/NameProvider'
import { Config } from '../../../sdk/DB'
import { blockCloud } from '../../../appConfig'

export const Configuration = (props: {
  title: string
  setShareConfig: (config: Config) => void
}) => {
  const { title } = props

  const { configurationOpen } = store.useState(
    (v) => v.configurationOpen.shareOpen
  )

  const { configStore, deviceStore, pageStore, shareStore, isKeyStore } = useStore()

  const { macroStore } = useStore()
  return useObserver(() => (
    <Fragment>
      <OutsideAlerter
        clickOutsideHandle={() => store.setState.configurationOpen(false)}>
        <dj.FlexView w={363} h={562} x={796} y={105} form={'配置页_domikey'} zIndex={2} radius={10}>
          <dj.FlexView
            w={363}
            h={61}
            justifyContent={'center'}
            alignItems={'center'}>
            <dj.Line y={61} lineColor={'UserCenter_domikey'} />
            <dj.Text relative h={22} type={'配置页标题_domikey'} text={title} />
          </dj.FlexView>
          <dj.FlexView w={363} h={18} y={76} justifyContent={'space-between'}>
            <dj.Button
              relative
              w={100}
              h={18}
              isHightLight={false}
              mode={'Bluer'}
              text={res.string.添加}
              clickHandle={async () => {
                await deviceStore.creatNewConfigToCurrentAndSave(
                  newConfigName(configStore.configList),
                  ''
                )
              }}
            />
            {!blockCloud &&
            <dj.Button
              relative
              w={70}
              h={18}
              isHightLight={false}
              mode={'Bluer'}
              textAlign={'left'}
              text={res.string.热门}
              clickHandle={() => {
                macroStore.stoptHook()
                store.setState.configurationOpen(false)
                shareStore.setCurrentShareListType('config')
                shareStore.setShareListPage('config', 'count')
                shareStore.configPageIndex = 0
                if (pageStore.pageIndex === shareStore.macrosPage) {
                  shareStore.getConfigShareList('count', 0)
                }
                pageStore.setPageIndex(shareStore.macrosPage)
              }}
            />}
          </dj.FlexView>

          <dj.List
            w={361}
            h={450}
            y={105}
            itemCount={configStore.configList.length}
            scrollToIndex={0}
            itemSize={() => 70}
            renderItem={(i) => {
              return (
                <div>
                  <ConfigurationBox
                    key={configStore.configList[i].localId}
                    config={configStore.configList[i]}
                    configurationOpen={configurationOpen}
                    shareOpen={isKeyStore.isShare}
                    onDelete={() => {
                      configStore.deleteConfig(configStore.configList[i])
                    }}
                    clickHandle={async (event) => {
                      if (
                        deviceStore.currentConfig.localId ===
                        configStore.configList[i].localId
                      )
                        return
                      event.persist()
                      await configStore.getConfigListFormDBSync();
                      deviceStore.setCurrentConfig(configStore.configList[i])
                      event.stopPropagation()
                      store.setState.configurationOpen(false)
                    }}
                    sharConfigClick={async () => {
                      await configStore.getConfigListFormDBSync()

                      props.setShareConfig(configStore.configList[i])
                    }}
                  />
                </div>
              )
            }}
          />
        </dj.FlexView>

      </OutsideAlerter>

      <dj.View w={180} h={22} x={962} y={686}>
        {''}
      </dj.View>
    </Fragment>
  ))
}
