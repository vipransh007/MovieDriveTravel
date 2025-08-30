import { useEffect, useState } from 'react';
import './App.css';
import Search from './components/Search.jsx';
import MovieCard from './components/MovieCard.jsx';
import {useDebounce} from 'react-use'


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debounceSearchTerm, setdebounceSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Corrected state setter name
  const [movieList, setMovieList] = useState([]); // Corrected state setter name



useDebounce(() => setdebounceSearchTerm(searchTerm),500,[searchTerm])


  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query ?
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error("Failed to fetch movies. Check your API key and network.");
      }

      // 1. GET THE DATA FIRST! This line was moved up.
      const data = await response.json();
      console.log(data);
      
      // 2. NOW you can use the data object.
      // The incorrect 'if' block for a different API has been removed.
      setMovieList(data.results || []);
      
    } catch (error) {
      console.error(`Error: ${error}`);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMovies(searchTerm);
  }, [searchTerm]);

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src='./hero.png' alt="Movie hero banner" />
            <h1 className='text-4xl'>Find <span className="text-gradient">MOVIES</span> You'll Enjoy Without the Hassle</h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className='all-movies'>
            <h2>All Movies</h2>
            
            {isLoading ? (
              <p className='text-white'>Loading...</p>
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  // IMPROVEMENT: Added a unique 'key' prop for each movie.
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;