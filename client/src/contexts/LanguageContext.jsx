import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: 'Dashboard', report: 'Report Challenge', my_challenges: 'My Challenges',
    notifications: 'Notifications', profile: 'Profile', logout: 'Logout',
    welcome: 'Welcome', total_challenges: 'Total Challenges', under_review: 'Under Review',
    matched_assigned: 'Matched/Assigned', accepted_active: 'Accepted & Active',
    title: 'Title', description: 'Description', analyze: 'Analyze', submit: 'Submit',
    submitted: 'Submitted', verified: 'Verified', matched: 'Matched', assigned: 'Assigned',
    rejected: 'Rejected', closed: 'Closed', login: 'Login', register: 'Register'
  },
  hi: {
    dashboard: 'डैशबोर्ड', report: 'समस्या दर्ज करें', my_challenges: 'मेरी समस्याएं',
    notifications: 'सूचनाएं', profile: 'प्रोफ़ाइल', logout: 'लॉग आउट',
    welcome: 'स्वागत है', total_challenges: 'कुल समस्याएं', under_review: 'समीक्षा के अधीन',
    matched_assigned: 'सुमेलित/सौंपी गई', accepted_active: 'स्वीकृत और सक्रिय',
    title: 'शीर्षक', description: 'विवरण', analyze: 'विश्लेषण करें', submit: 'जमा करें',
    submitted: 'जमा किया गया', verified: 'सत्यापित', matched: 'सुमेलित', assigned: 'सौंपी गई',
    rejected: 'अस्वीकृत', closed: 'बंद', login: 'लॉग इन', register: 'पंजीकरण'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);