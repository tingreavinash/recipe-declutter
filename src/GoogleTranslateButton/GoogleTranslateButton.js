import React, { useEffect } from 'react';

const GoogleTranslateButton = () => {
  useEffect(() => {
    // Callback function for Google Translate API initialization
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en' },
        'google-translate-button'
      );
    };

    // Load the Google Translate API
    const script = document.createElement('script');
    script.src =
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google-translate-button"></div>;
};

export default GoogleTranslateButton;
