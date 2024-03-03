import { useEffect, useState,useRef } from "react";
import React from "react";
import StarRating from './StarRating';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);


  const key="10d08ddf";
  export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]); //main component movie
  //const [watched,setWatched]=useState([]);
  const [isLoading,setIsLoading]=useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null); 

  const [watched,setWatched]=useState(function() {
    const storedValue =localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });
  
  function handleSelectMovie(id) {
    setSelectedId(selectedId => (id === selectedId ? null: id));
  }
  

  function HandleCloseMovie(params) {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {     //to pass movie to the watched movie list component from state watched
    setWatched((watched)=>[...watched,movie]);
    console.log(watched);
   // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  

  }
  
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );


  
  useEffect( function(){
    const controller = new AbortController();
    async function fetchMovies(){
     try { setIsLoading(true);
      setError("");
      const res= await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${query}`,{ signal: controller.signal });

      //error handeling which may occur after fetching data
      if (!res.ok) // for no internet before or while fetching
       throw new Error("Something went wrong with fetching movies");
      const data= await res.json();
      if(data.Response === 'False')throw new Error("Movie not founded");
       
      setMovies(data.Search);
      console.log(data.Search);  
      console.log(data);
      console.log(movies); //await bhara empty bhaho after yo function run bhayesi matrai run hucnha
      setError("");
    }catch(err){
      
      if (err.name !== "AbortError") {
        console.log(err.message);
        setError(err.message); 
      }
      
    } finally{
    setIsLoading(false);
    }
    }
    if(query.length<=2){ //if no query means if queory is  0
      setMovies([]);
      setError('');
      return; //exited from loop
    }

    

    HandleCloseMovie();
    fetchMovies();
    return function(){
      controller.abort();
    };

  },[query]);  //jaba jaba query change huncha taba taba use efeect chalcha 
  
  
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
            
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
          {error && <ErrorMessage message={error} />}
        </Box>
        
        <Box>
          { selectedId ? <MovieDetails selectedId={selectedId}
          onCloseMovie={HandleCloseMovie}  onAddWatched={handleAddWatched} watched={watched} 
          /> :
           <>
           <WatchedSummary watched={watched} />     {/* duita component lai if else jasari rakhna mildaina kinabhaney yo duita parent component ho so we cannot put in jsx so we use fragments */}
           <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
           </>
          }
        </Box>
      </Main>
    </>
  );
}

function Loader(params) {
   return <p className="loader">Loading ... Please Wait 😊 </p>
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  //state less components ani jun chain ekkai choti run hunai paryo ekthauma grouping gareko

  return (
    <nav className="nav-bar">
      <Logo />
      {children}
      {/* mathi children banayesi tala yeta children thapdina parcha */}
    </nav>
  );
}
function Logo(params) {
  // console.log(tempMovieData); prop drilling ley garda tempMovieData sab children component mah ni pass huncha
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({query,setQuery}) { 
  const inputEl= useRef(null); 
  
  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;

        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }

      document.addEventListener("keydown", callback);
      return () => document.addEventListener("keydown", callback);
    },
    [setQuery]
  );
  
  //to connect with element 
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(
        events                           //onchange event argument ho kinaki call gardai value pass gareko cha rah events euta parameter ho jasma value chaiyeko cha
      ) => setQuery(events.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}


function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie}) {
  return (
    <li onClick={()=>onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}


function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
 
  const [movie, setmovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');
  const isWatched = watched.map((movie)=>movie.imdbID).includes(selectedId);

  
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating ;

  const{Title: title, Year: year, Poster: poster , Runtime: runtime, imdbRating, Plot: plot, Released: released, Actors: actors, Director: director , Genre }=movie;
  
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating:Number(imdbRating),
      runtime:Number(runtime.split(" ").at(0)),userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }
   
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );
  
  useEffect(function(){
    setIsLoading(true);
    async function getMovieDetails() {
      const res= await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`);
      const data = await res.json();
      setmovie(data);
      console.log(data);
      setIsLoading(false);
    }
    getMovieDetails();
  },[selectedId])    // [] yo matrai bhayesi ekchoti matrai run hunthy so arko movieko id select garda dekhaudaina thyo so tesko lagi we put id state   
 
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        // console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]  
  );   
  
  return (
    <div className="details">
      {isLoading ? <Loader /> :
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
            <img src={poster} alt={`poster of the movie ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime}</p>
              <p>{Genre}</p>
              <p><span>⭐</span>{imdbRating} IMDb rating</p>
            </div>
          </header>
  
          <section>
            <div className="rating">
              {!isWatched?
              <>
              <StarRating maxRating={10} size={20} onSetRating={setUserRating} />
              {userRating >  0 && (<button className="btn-add" onClick={handleAdd}> Add to watched list ?</button>)}
              </>: (<p>You rated  {watchedUserRating} already to this movie</p>)
              }
            </div>
              <p>{console.log(userRating)}</p>
            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      }
    </div>
  );

}




function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched , onDeleteWatched}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID}  onDeleteWatched={onDeleteWatched}/>
      ))}
    </ul>
  );
}

function WatchedMovie({ movie ,onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}