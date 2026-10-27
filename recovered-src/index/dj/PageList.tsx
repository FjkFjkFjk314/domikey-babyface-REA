import styled from '@emotion/styled'
import React from 'react'
import ReactPaginate from 'react-paginate'
import { FlexView } from './FlexView'

const Div = styled.div({
  color: '#d0d1d1',

  '& ul': {
    display: 'inline-block',
    paddingLeft: '15px',
    paddingRight: '15px',
  },
  '& li': {
    display: 'inline-block',
    paddingLeft: 20,
  },
  '& a': {
    outline: 'none',
  },
})

export interface PageListProps {
  count: number
  pageIndex: number
  currentPage: number
  setPage: (index: number) => void
}

export const PageList = (p: PageListProps) => {
  return (
    <FlexView justifyContent={'center'}>
      <Div>
        <ReactPaginate
          previousLabel={'<'}
          nextLabel={'>'}
          breakLabel={'...'}
          initialPage={p.pageIndex}
          forcePage={p.currentPage}
          pageCount={p.count}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          activeClassName={'light-page'}
          onPageChange={(selectedItem: { selected: number }) =>
            p.setPage(selectedItem.selected)
          }
        />
      </Div>
    </FlexView>
  )
}
