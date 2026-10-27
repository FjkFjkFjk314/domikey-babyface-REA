import React from 'react'
import styled from '@emotion/styled'
import { dj } from '.'

const Container = styled.div({
    outline: 'none',
    appearance: 'none',
    position: 'relative',
    width: 40,
    height: 20,
    background: '#ccc',
    borderRadius: 10,
    transition: 'border-color .3s, background-color .3s',
},
    (props: { background: string }) => ({
        background: props.background
    })
)


const CirclePointer = styled.div((p: { left: number | string }) => ({
    width: 16,
    height: 16,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0, 0, 2px, #999',
    transition: '.4s',
    top: 2,
    position: 'absolute',
    left: p.left,
}))

export const SwitchButton = (
    p: {
        skey: boolean | undefined,
        clickHandle?: () => void,
        dazzle?: boolean
    }
) => (
    <div style={{ paddingLeft: 15 }}>
        <dj.View
            w={40}
            h={20}>
            <Container
                background={p.dazzle ?
                    p.skey ? 'linear-gradient(to bottom,#2c00ff,#00f7fe,#13fe00,#f0ff00,#fc9f1b)' : '#6c6c6c' :
                    p.skey ? 'linear-gradient(to bottom,#a30f23,#cd3b50)' : '#6c6c6c'}
                onClick={() => {
                    p.clickHandle && p.clickHandle()
                }}
            >
                <CirclePointer left={p.skey ? '55%' : 2} />
            </Container>
        </dj.View>
    </div>
)