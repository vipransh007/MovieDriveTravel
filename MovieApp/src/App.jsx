import { useEffect, useState } from 'react';
import './App.css';
import Search from './components/Search.jsx';
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import { updateSearchCount } from './appwrite.js';

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
  const [trendingMovie, setTrendingMovie] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [movieList, setMovieList] = useState([]);

  // This correctly sets the debounced value after a 500ms delay
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error("Failed to fetch movies. Check your API key and network.");
      }

      const data = await response.json();
      console.log("API Response:", data); // This should now log correctly
      
      setMovieList(data.results || []);
      
      // Only update search count if the user actually searched for something
      if(query && data.results.length > 0){
        await updateSearchCount(query , data.results[0])
      }


    } catch (error) {
      console.error(`Error: ${error}`);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
const loadTrendingMovies = async () => {
  try {
    const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, API_OPTIONS);
    if (!response.ok) {
      throw new Error("Failed to fetch movies. Check your API key and network.");
    }

    const data = await response.json();
    console.log("API Response:", data);
    
    // CORRECT: Use .slice(0, 5) to get the first 5 movies from the array
    setTrendingMovie(data.results.sort(() => 0.5 - Math.random()));

  } catch (error) {
    console.log(error);
  }
};

  // CORRECTED: This effect now watches the debounced search term
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
    
    loadTrendingMovies();
  }, [debouncedSearchTerm]); // ✅ This now runs only after the user stops typing
 
 
  useEffect(() => {
    loadTrendingMovies();
  }, []); 

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <h1 className='text-7xl'>Welcome to <span className="text-gradient text-8xl font-bold">MOVIE </span> Mania</h1>
            <img src='./hero.png' alt="Movie hero banner" />
            <h1 className='text-9xl p-3 leading-25'>Find <span className="text-gradient font-bold">MOVIES</span> You'll Enjoy Without any Hassle</h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              
              {trendingMovie.map((movie, index) => (
                <li key={movie.$id} >
                  <p>{index+1}</p>
                  <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt="" />
                </li>
              ))}
            </ul>
          </section>

          <section className='all-movies'>
            <h2>All Movies</h2>
            
            {isLoading ? (
              <p className='text-white'>Loading...</p>
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
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