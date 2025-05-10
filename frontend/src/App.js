import { useEffect, useState } from "react";
import './Apps.scss';
import Search from "./Search"

function App() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState(false);

  let id;

  // const statuses = ["starting", "downloading", "extracting", "ready"];
  // let i = 0;

  async function checkStatus() {
    let response = await fetch('/api/status');
    let data = await response.json();

    setStatus(data.status);
    // setStatus(statuses[i]);
    // i++;
    // if (i >= statuses.length) {
    //   i = 0;
    // }

    if (data.status == "ready") {
      setIsReady(true);
      clearTimeout(id);
    } else {
      setTimeout(checkStatus, 1000);
    }
  }

  useEffect(() => {
    checkStatus();
    return () => clearTimeout(id);
  }, []);

  return <div class="app">
    {isReady && <Search />}
    {!isReady &&
      <div class="loading">
        <div>
          <h1>Setting things up</h1>
          <div>
            {status == "starting" && <p class="slide-up">Starting app...</p>}
            {status == "downloading" && <p class="slide-up">Downloading database...</p>}
            {status == "extracting" && <p class="slide-up">Extracting database...</p>}
          </div>
        </div>
      </div>
    }
  </div>
}

export default App;