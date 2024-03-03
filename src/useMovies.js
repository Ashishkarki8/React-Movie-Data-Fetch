import { useState,useEffect } from "react";

export function useMovies(params) {
    const [movies, setMovies] = useState([]); //main component movie
  //const [watched,setWatched]=useState([]);
  const [isLoading,setIsLoading]=useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null); 

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
    
      },[query]);
}