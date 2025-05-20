
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
      props.onSaveNote('New Note');
    }
  };
  return (
    <button className="create-note-button" onClick={handleClick}>
      Create Note
    </button>
  );
}
