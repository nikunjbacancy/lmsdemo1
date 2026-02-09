export const STRINGS = {
  APP_NAME: "LifeNotes",
  APP_SUBTITLE: "Your personal note-taking companion",
  
  // Authentication
  LOGIN_TITLE: "Welcome Back",
  LOGIN_USERNAME_LABEL: "Username",
  LOGIN_USERNAME_PLACEHOLDER: "Enter your username",
  LOGIN_PASSWORD_LABEL: "Password",
  LOGIN_PASSWORD_PLACEHOLDER: "Enter your password",
  LOGIN_BUTTON: "Login",
  LOGOUT_BUTTON: "Logout",
  HEADER_WELCOME: "Welcome,",
  
  // Notes
  NOTES_HEADER: "My Notes",
  INPUT_PLACEHOLDER: "Write your note here...",
  ADD_NOTE_BUTTON: "➕ Add Note",
  DELETE_BUTTON_TITLE: "Delete note",
  DELETE_CONFIRMATION: "Are you sure you want to delete this note?",
  
  // Filters
  FILTER_ALL: "All",
  EMPTY_STATE_ALL: "📝 No notes yet. Start writing!",
  EMPTY_STATE_FILTERED: (filter) => `📝 No notes found for "${filter}".`,
  
  // Private Notes
  PRIVATE_HIDDEN_TEXT: "Private content hidden",
  PRIVATE_SHOW_TITLE: "Show private note",
  PRIVATE_HIDE_TITLE: "Hide private note"
};

export const AVAILABLE_TAGS = [
  "General", 
  "Gym", 
  "Food", 
  "Bills", 
  "Work", 
  "Shopping", 
  "Personal", 
  "Private"
];

export const DEFAULT_TAG = "General";

export const DELETE_ANIMATION_DURATION = 400;
