import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import App from "./App.jsx";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/elements.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)