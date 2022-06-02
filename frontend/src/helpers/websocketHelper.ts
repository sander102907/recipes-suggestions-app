export default class WebsocketHelper {
    public static getWsUrl() {
        let loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        new_uri += loc.pathname + "/api/";
        return new_uri;
    }
}