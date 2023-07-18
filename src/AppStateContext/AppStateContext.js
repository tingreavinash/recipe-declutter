import React, { createContext, useState } from "react";

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [state, setState] = useState({
    language: 'en',
    url: '',
    submittedUrl: '',
    recipeData: '',
    displayRecipeData: ''
  });

  return (
    <AppStateContext.Provider value={{ state, setState }}>
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateContext;
