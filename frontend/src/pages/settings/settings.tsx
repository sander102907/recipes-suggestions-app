import React, { useState } from "react";
import "./settings.css";
import axios from "axios";
import LoadButton from "../../components/loadButton/loadButton";
import LogWindow from "../../components/logWindow/logWindow";

const Settings = () => {
  const [syncLoading, setSyncLoading] = useState(false);

  const syncBonus = () => {
    setSyncLoading(true);
    axios.get("/api/ah/syncproducts").then((response) => setSyncLoading(false));
  };
  return (
    <div className="Settings">
      <h1>Settings</h1>
      <LoadButton
        variant="primary"
        onClick={syncBonus}
        text="Synchronize products"
        loading={syncLoading}
        loadText="Updating the database.."
      />

      <LogWindow />
    </div>
  );
};

export default Settings;
