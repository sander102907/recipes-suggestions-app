import React, { useState } from 'react';
import './settings.css';
import axios from 'axios';
import LoadButton from "../../components/loadButton/loadButton";

const Settings = () => {
  const [syncBonusLoading, setSyncBonusLoading] = useState(false);
  
  const syncBonus = () => {
    setSyncBonusLoading(true);
    axios.get("/api/ah/syncbonus")
      .then((response) => setSyncBonusLoading(false));
  };
  
  return (
    <div className='Settings'>
      <h1>Settings</h1>
      <LoadButton 
        variant="primary" 
        onClick={syncBonus} 
        text="Sync bonus deals" 
        loading={syncBonusLoading} 
        loadText="Getting the best deals for you.." 
      />
    </div>
  );
}

export default Settings;