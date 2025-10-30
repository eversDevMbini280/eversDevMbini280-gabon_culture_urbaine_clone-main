'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music } from 'lucide-react';

const AudioPlayer = ({ songs = [], apiUrl }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      // Auto play next song
      if (currentSongIndex < songs.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSongIndex, songs.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setError(null);
      audioRef.current.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play audio');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const skipToNext = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const skipToPrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAudioUrl = (audioUrl) => {
    if (!audioUrl) return null;
    return audioUrl.startsWith('http') || audioUrl.startsWith('//')
      ? audioUrl
      : `${apiUrl}${audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`}`;
  };

  if (!songs || songs.length === 0) {
    return (
      <div className="bg-blue-800 rounded-lg p-6 text-center">
        <Music className="w-12 h-12 text-blue-300 mx-auto mb-3" />
        <p className="text-blue-200">Aucune chanson disponible pour le moment</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-6 shadow-lg">
      <audio
        ref={audioRef}
        src={currentSong ? getAudioUrl(currentSong.audio_url) : ''}
        preload="metadata"
      />

      {/* Current Song Info */}
      <div className="flex items-center mb-4">
        {currentSong?.image_url ? (
          <img
            src={currentSong.image_url}
            alt={currentSong.title}
            className="w-16 h-16 rounded-lg object-cover mr-4"
          />
        ) : (
          <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mr-4">
            <Music className="w-8 h-8 text-blue-300" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg line-clamp-1">
            {currentSong?.title || 'No Song Selected'}
          </h3>
          <p className="text-blue-200 text-sm">
            {currentSong?.author_name || 'Unknown Artist'}
          </p>
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>
        {isLoading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          className="w-full bg-blue-600 rounded-full h-2 cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <div
            className="bg-white h-full transition-all duration-100"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
            }}
          ></div>
        </div>
        <div className="flex justify-between text-blue-200 text-xs mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={skipToPrevious}
            disabled={currentSongIndex === 0}
            className="p-2 rounded-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={togglePlayPause}
            disabled={!currentSong || isLoading}
            className="p-3 rounded-full bg-white text-blue-800 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={skipToNext}
            disabled={currentSongIndex === songs.length - 1}
            className="p-2 rounded-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-blue-700 hover:bg-blue-600 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-blue-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Song Queue */}
      {songs.length > 1 && (
        <div className="mt-4 pt-4 border-t border-blue-700">
          <h4 className="text-blue-200 text-sm font-medium mb-2">
            Playlist ({songs.length} chansons)
          </h4>
          <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-800">
            {songs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => {
                  setCurrentSongIndex(index);
                  setIsPlaying(false);
                }}
                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                  index === currentSongIndex
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-700/50 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 flex-shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs opacity-80 truncate">{song.author_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
