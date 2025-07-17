import React, { useState } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";

const API_URL = "http://localhost:3000"; // Change to your backend URL if needed

export default function PrivyAuthDemo() {

  const { user, authenticated, ready, logout, getAccessToken } = usePrivy();
  const { login } = useLogin();
  const [apiResponse, setApiResponse] = useState("");
  const [idToken, setIdToken] = useState("");

  // Fetch JWT after login
  React.useEffect(() => {
    if (authenticated) {
      getAccessToken().then(token => {
        if (token) setIdToken(token);
      });
    } else {
      setIdToken("");
    }
  }, [authenticated, getAccessToken]);

  const callProtectedApi = async () => {
    
    if (!idToken) {
      alert("Please login and get a JWT first.");
      return;
    }
    try {
      console.log("Sending idToken:", idToken); // Add this line
      const res = await fetch(`${API_URL}/api/protected`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setApiResponse("Error: " + errorMsg);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Privy Auth Test Frontend</h2>
      {!authenticated ? (
        <button onClick={login} style={{ marginBottom: 16 }} disabled={!ready}>
          Sign in with Privy
        </button>
      ) : (
        <button onClick={logout} style={{ marginBottom: 16 }}>
          Logout
        </button>
      )}
      {idToken && (
        <div>
          <h4>Your JWT (idToken):</h4>
          <textarea value={idToken} readOnly rows={4} style={{ width: "100%" }} />
        </div>
      )}
      <button onClick={callProtectedApi} style={{ margin: "16px 0" }}>
        Call Protected API
      </button>
      {apiResponse && (
        <div>
          <h4>API Response:</h4>
          <pre>{apiResponse}</pre>
        </div>
      )}
    </div>
  );
}
