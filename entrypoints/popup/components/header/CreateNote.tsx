import './header.css';

interface CreateNoteProps {
  onSaveNote: (title: string) => void;
}

export const CreateNote = (props: CreateNoteProps) => {
  const handleClick = () => {
    // Handle the click event for creating a note
    console.log('Create Note button clicked');
    // as the user is creating the note, ask for the title
    const title = prompt('Enter a title for your note');
    if (title) {
      // sends the title and the action to App.tsx to save the note
      props.onSaveNote(title);
    }
    else {
      alert('Not saved! You must enter a title for your note.');
    }
  };

  const NoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );

  return (
    <button className="create-note-button" onClick={handleClick}>
      <NoteIcon />
    </button>
  );
};
