import React from 'react'

const Search = ({SearchTerm,setSearchTerm}) => {
  return (
    <div className='search'>

      <div>
        
        <img src="./search.png" alt="search" />
        <input type="text" placeholder='Enter Your Movie Here...' 
        value={SearchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

    </div>
  )
}

export default Search