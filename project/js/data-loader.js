const EMBEDDED_SITE_DATA = {
  "activities.json": [
    {
      "id": 1,
      "title": "Educational Programs",
      "category": "education",
      "description": "Community learning activities."
    },
    {
      "id": 2,
      "title": "Cultural Exchange",
      "category": "culture",
      "description": "Sharing traditions and experiences."
    },
    {
      "id": 3,
      "title": "Sustainability Project",
      "category": "environment",
      "description": "Environmental awareness programs."
    }
  ],
  "news.json": [
    {
      "id": 1,
      "title": "Community Learning Workshop",
      "date": "2026-05-01",
      "category": "education"
    },
    {
      "id": 2,
      "title": "Cultural Exchange Event",
      "date": "2026-04-15",
      "category": "culture"
    }
  ],
  "events.json": [
    {
      "id": 1,
      "title": "Educational Programs",
      "category": "education",
      "description": "Community learning activities."
    },
    {
      "id": 2,
      "title": "Cultural Exchange",
      "category": "culture",
      "description": "Sharing traditions and experiences."
    },
    {
      "id": 3,
      "title": "Sustainability Project",
      "category": "environment",
      "description": "Environmental awareness programs."
    }
  ]
};

async function loadJsonData(file){
    try{
        if(window.location.protocol === "file:" && EMBEDDED_SITE_DATA[file]){
            return EMBEDDED_SITE_DATA[file];
        }
        const response = await fetch(`locales/${file}`);
        if(!response.ok){
            throw new Error(`Could not load ${file}`);
        }
        return await response.json();
    }catch(error){
        console.warn("Data fetch failed; using embedded fallback:", error);
        return EMBEDDED_SITE_DATA[file] || [];
    }
}

async function loadActivities(){
    return await loadJsonData("activities.json");
}

async function loadNews(){
    return await loadJsonData("news.json");
}

async function loadEvents(){
    return await loadJsonData("events.json");
}

async function loadSiteData(){
    try{
        const activities = await loadActivities();
        const news = await loadNews();
        const events = await loadEvents();
        return { activities, news, events };
    }catch(error){
        console.error("Data loading failed:", error);
        return { activities: [], news: [], events: [] };
    }
}
