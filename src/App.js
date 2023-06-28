import logo from './logo.svg';
import './App.css';
import RecipeSummarizer from './RecipeSummarizer/RecipeSummarizer';
import { LanguageProvider } from './LanguageContext/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <RecipeSummarizer />
    </LanguageProvider>

  );
}

export default App;
