import {useEffect, useState } from 'react'
import './App.css'
import Search from './components/Search.jsx'
// import hero from './assets/hero.png'

const API_BASE_URL = 'https://api.themoviedb.org/3/discover/movie'
const API_KEY= import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
  method:'GET',
  headers: {
    accept: 'application.json',
    Authrization: `Bearer ${API_KEY}`
  }
}

function App() {
const [SearchTerm, setSearchTerm] = useState('');
const [error, setError] = useState('');
 
useEffect(() => {
  const fetchMovies = async () => {
    try{

    }
    catch(error){
      console.log(`Error : ${error}`);
      
    }
  }
}, [])

  return (
  <main>
    console.log(setSearchTerm);
    

    <div className="pattern">

      <div className="wrapper">
        <header>
          <img src='./hero.png' alt="" />
          <h1 className='text-4xl'>Find <span className="text-gradient">MOVIES</span> You'll Enjoy Without the Hassle</h1>
      <Search SearchTerm={SearchTerm} setSearchTerm={setSearchTerm}/>
        </header>

      <section className='all-movies'>
        <h2>ALl Movies</h2>
        
      </section>
      </div>
    </div>

  </main>
  )
}

export default App

// eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMzRkMzJkMjQ3ZjUyMzdkZTEwNWZmOTRkNTNiN2ExOCIsIm5iZiI6MTc1NjQ5ODc5Ny40NzgwMDAyLCJzdWIiOiI2OGIyMGI2ZDc0ZjYwYjQzN2YyMDAxMTUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Ov8arJcnQOJesHaNwRsWu_MwpHZV2HQ8lYmbc1r5u8Y
// ACCESS TOKEN