import React from 'react'
import styled from '@emotion/styled'
import { res } from '../res'
import { useStore } from '../mobxStore/store'

const Select = styled.select({
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    outline: 0,
    boxShadow: 'none',
    border: '1px solid #a5a5a5',
    background: '#333333',
    backgroundImage: 'none',
    flex: 1,
    color: '#959595',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    '& :disabled': {
        opacity: '0.4',
    },
    '& option': {
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
        backgroundColor: '#000',
        height: '50px',
        display: 'block',
        width: '200px',
        marginTop: '15px',
        marginBottom: '15px',
    },
    '& option:hover': {
        // backgroundColor: 'linear-gradient(rgba(7,0,3,0),rgba(22,150,135,1))',
        backgroundColor: '#EBCCD1'
    },
})


const Div = styled.div((p: { overflow?: string }) => ({
    borderRadius: '2px',
    textAlignLast: 'center',
    fontSize: 7,
    backgroundColor: '#333333',
    width: '100%',
    height: '100%',
    overflow: p.overflow ? p.overflow : 'visible',
    '& span': {
        color: '#959595',
        fontSize: '12px',
        lineHeight: '28px',
    },
    '&::-webkit-scrollbar': {
        width: '15px',
        height: '3px',
        backgroundColor: '#f7f7f7'
    },
    '&::-webkit-scrollbar-thumb': {
        // background: 'linear-gradient(to right,#4d4d4d,#1a1a1a)',
        background: '#fff',
        borderRadius: '5px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f7f7f7',
        borderRadius: '5px',
        border: '1px solid #eee'
    },

})
)

const Option = styled.div({
    width: '100%',
    height: '30px',
    backgroundColor: '#fff',
    color: '#747473',
    fontSize: '12px',
    lineHeight: '30px',
    '&:hover': {
        background: 'linear-gradient(to bottom,rgba(255,255,255,1),rgba(200,200,200,1))',
    }
})

export const ComboBoxSelect = (props: {
    modes: string[]
    onChange: (index: number) => void
    overflow?: string
    // isDisabled?: boolean
    // clickHandle?: () => void
}) => {

    // const { profileStore } = useStore();

    return (
        <Div overflow={props.overflow}>
            {/* <Select
        id='slct'
        disabled={props.isDisabled}
        value={props.selectedValue}
        onChange={(e) =>
          props.onChange(props.modes.findIndex((v) => v === e.target.value))
        }>
        {props.modes.map((value, index) => (
          <option key={index}>{value}</option>
        ))}
      </Select> */}
            {props.modes.map((value, index) => (
                <Option key={index}
                    onClick={() => {
                        props.onChange(props.modes.findIndex((v) => v === value))
                        // profileStore.currentProfileName = value;
                    }}
                >{value}</Option>
            ))}
        </Div>
    )
}