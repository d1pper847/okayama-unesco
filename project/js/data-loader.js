async function loadJsonData(file){
    const response = await fetch(`data/${file}`);
    return await response.json();
}

async function loadActivities(){
    return await loadJsonData('activities.json');
}

async function loadNews(){
    return await loadJsonData('news.json');
}

async function loadEvents(){
    return await loadJsonData('events.json');
}

async function loadSiteData(){
    try{
        const activities = await loadActivities();
        const news = await loadNews();
        const events = await loadEvents();

        console.log('Activities:', activities);
        console.log('News:', news);
        console.log('Events:', events);
    }
    catch(error){
        console.error('Data loading failed:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadSiteData);
