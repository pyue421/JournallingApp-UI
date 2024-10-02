import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './JournalEntryForm.css';
import AnimatedToolbar from '../AnimatedToolBar/AnimatedToolBar';

export const JournalEntryForm = ({ selectedDate, title, onSave, entry, mood, imageFile, musicLink }) => {
  const [journalTitle, setJournalTitle] = useState(title);
  const [journalMood, setMood] = useState(mood);
  const [journalEntry, setJournalEntry] = useState(entry);
  const [journalImage, setJournalImage] = useState(imageFile);
  const [journalMusicLink, setJournalMusicLink] = useState(musicLink);

  const [entryUnfilled, setEntryUnfilled] = useState(false);
  const [moodUnfilled, setMoodUnfilled] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [musicButtonContent, setMusicButtonContent] = useState('Search');


  useEffect(() => {
    setJournalTitle(title || '');
    setJournalEntry(entry || '');
    setMood(mood || '');
    setJournalImage(imageFile || null);
    setJournalMusicLink(musicLink || '');
    musicLink? setMusicButtonContent('Edit') : setMusicButtonContent('Search');
  }, [entry, mood, imageFile, musicLink]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setJournalImage(reader.result); // Update state with base64 image data
    };

    if (file) {
      reader.readAsDataURL(file); // Convert file to base64 string
    }
  };

  function convertSpotifyUrl(url) {
    // Define the base URL for embedding
    const embedBaseUrl = "https://open.spotify.com/embed/track/";
    const queryParams = "?utm_source=generator&theme=0";
    
    // Extract the track ID from the original URL
    const urlParts = url.split('/');
    const trackId = urlParts[urlParts.length - 1];

    const embedUrl = `${embedBaseUrl}${trackId}${queryParams}`;

    // Construct the new embeddable URL
    if (url === '') return '';

    return embedUrl;
  }

  const handleSearchMusicClick = () => {
    if (musicButtonContent === 'Search') {
      setJournalMusicLink(convertSpotifyUrl(journalMusicLink));
      setShowPlayer(true);
      setMusicButtonContent('Edit');
    }
    else if (musicButtonContent === 'Edit') {
      setJournalMusicLink('');
      setShowPlayer(false);
      setMusicButtonContent('Search');
    }
  };

  const handleSave = () => {
    if (journalMood !== '' && journalEntry !== '') {
      setEntryUnfilled(false);
      setMoodUnfilled(false);
  
      const journal = {
        title: journalTitle,
        date: selectedDate,
        mood: journalMood,
        entry: journalEntry,
        image: journalImage,
        musicLink: journalMusicLink
      };
  
      // POST request to save the journal entry
      axios.post('http://localhost:8000/api/entries', journal)
      .then(response => {
        console.log('Journal saved:', response.data);

        // Clear fields and provide feedback
        setJournalTitle('');
        setJournalEntry('');
        setMood('');
        setJournalImage(null);
        setJournalMusicLink('');

        // Call the parent onSave function
        if (typeof onSave === 'function') {
          onSave(selectedDate, journalTitle, journalMood, journalEntry, journalImage, journalMusicLink);
        }
      })
      .catch(error => {
        console.error('There was an error saving the journal!', error);
        // You could show an error message to the user here
      });
    }
  };

  const handleAddOptions = (item) => {
    if (item == 'addImage') {
      setShowAddImage(true);
    }
    else if (item == 'addMusic') {
      setShowAddMusic(true);
    }
  };


  return (
    <div className='journal-container'>
       <textarea className='title-textarea' type="text" placeholder='Title '
        value={journalTitle}
        onChange={(e) => setJournalTitle(e.target.value)}
      />
      
      {
        showAddMusic && (
          <div style={{display: 'flex', flexWrap: 'wrap', marginBottom: '1rem'}}>
            <p>Song for the day: </p>
            {
              (musicButtonContent === 'Search' && !showPlayer) &&
              <textarea className='music-link-textarea' type="text"
              placeholder='Copy and paste Spotify link here ... '
              value={journalMusicLink}
              onChange={(e) => setJournalMusicLink(e.target.value)}
              />
            }
            <button className='music-search-button' onClick={handleSearchMusicClick}>{musicButtonContent}</button>
            {((journalMusicLink !== '') && showPlayer) && 
            <iframe style={{borderRadius:'1.5rem'}} src={journalMusicLink} width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          }
          </div>
        )
      }

      {
        showAddImage && 
        (
          <div>
            <div style={{display: 'flex', flexWrap: 'wrap', marginBottom: '1rem'}}>
              <p>Add image (optional):</p>
              <input type='file' onChange={handleImageUpload}/>
            </div>
            {journalImage && <img className='uploaded-photo' src={journalImage} alt='Uploaded' />}
          </div>
        )
      }

      <p className={(entryUnfilled && journalEntry === '') ? 'alert' : 'initial'}>
      {(entryUnfilled && journalEntry === '') && <span className='alert'>Missing! </span>}
      </p> 
      <textarea className='journal-textarea' type="text" placeholder='Start typing here ... '
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
      />
      
      <AnimatedToolbar onItemClick={handleAddOptions} />

      <button className='save-button' onClick={handleSave}>Save</button>
    </div>
    
  );
};

JournalEntryForm.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  title: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  entry: PropTypes.string,
  mood: PropTypes.string
};