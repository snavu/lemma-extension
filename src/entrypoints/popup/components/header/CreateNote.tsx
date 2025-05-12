
import './header.css';

export const CreateNote = () => {
  const handleClick = () => {
    // Handle the click event for creating a note
    console.log('Create Note button clicked');
  };
  return (
    <button className="create-note-button" style={{ backgroundColor: 'blue', color: 'white', padding: '10px', borderRadius: '5px' }}>
      Create Note
    </button>
  );
}
