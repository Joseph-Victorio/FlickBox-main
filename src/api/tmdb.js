// src/api.js
export const fetchFilmDetails = async (id) => {
  try {
    const API_KEY = '8f74ba3476a16e78682cadadd1456462';
    const BASE_URL = 'https://api.themoviedb.org/3/movie';

    const response = await fetch(
      `${BASE_URL}/${id}?api_key=${API_KEY}&append_to_response=credits,videos`
    );

    if (!response.ok) throw new Error('Failed to fetch movie details');

    const data = await response.json();

    const releaseYear = data.release_date ? parseInt(data.release_date.substring(0, 4)) : 0;
    if (releaseYear < 2000) throw new Error('Film released before 2000');

    const director =
      data.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown';

    const cast = (data.credits?.cast || []).slice(0, 3).map(person => person.name);

    const runtime = data.runtime || 0;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    const duration = runtime ? `${hours}h ${minutes}m` : 'N/A';

    const trailer = data.videos?.results?.find(
      video => video.site === 'YouTube' && video.type === 'Trailer'
    );

    return {
      id: data.id,
      title: data.title,
      rating: data.vote_average ? (data.vote_average / 2).toFixed(1) : '0.0',
      year: data.release_date?.substring(0, 4) || 'N/A',
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image',
      backdrop: data.backdrop_path
        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
        : 'https://via.placeholder.com/1920x1080?text=No+Image',
      overview: data.overview || 'No description available.',
      genre: data.genres?.map(genre => genre.name) || [],
      cast,
      director,
      duration,
      trailerId: trailer?.key || null,
    };
  } catch (error) {
    console.error('Failed to fetch film details:', error.message);
    return null;
  }
};

export const fetchMoviesByYear = async (page = 1) => {
  try {
    const API_KEY = '8f74ba3476a16e78682cadadd1456462';
    const BASE_URL = 'https://api.themoviedb.org/3/discover/movie';
    
    const response = await fetch(
      `${BASE_URL}?api_key=${API_KEY}&page=${page}&primary_release_date.gte=2000-01-01`
    );

    if (!response.ok) throw new Error('Failed to fetch movies');

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch movies:', error.message);
    return [];
  }
};

// ✅ Tambahan: Fetch Upcoming Movies
export const fetchUpcomingMovies = async (page = 1) => {
  try {
    const API_KEY = '8f74ba3476a16e78682cadadd1456462';
    const BASE_URL = 'https://api.themoviedb.org/3/movie/upcoming';

    const response = await fetch(
      `${BASE_URL}?api_key=${API_KEY}&language=en-US&page=${page}`
    );

    if (!response.ok) throw new Error('Failed to fetch upcoming movies');

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch upcoming movies:', error.message);
    return [];
  }
};
