/**
 * 
 * @param {string} url 
 * @param {RequestInit} options 
 * @returns 
 */
export async function fetchJSON(url, options={}){
    const headers = {Accept:'application/json', ...options.headers}
    if(options.json){
        options.body = JSON.stringify(options.json)
        headers['Content-type'] = "application/json"; 
        
    }
    const r = await fetch(url, {...options, headers});
    if(r.ok){
        return r.json();
    }
    throw new Error("Erreur server", {cause: r})
}