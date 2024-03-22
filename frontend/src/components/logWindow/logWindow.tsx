import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";
import { useEffect, useRef, useState } from "react";
import { Log } from "../../interfaces/log";
import axios from "axios";

type Props = {
}

const LogWindow = ({ }: Props) => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useInterval(() => {
        axios.get(`/api/logs/cronjobs?fromTime=${lastUpdated.toISOString()}`).then(response => {
            setLastUpdated(new Date());
            console.log(response.data);
            if (response.data.length > 0) {
                setLogs([response.data, ...logs]);
            }
        });
    }, 1000);


    useEffect(() => {
        axios.get('/api/logs/cronjobs').then(response => {
            setLogs(response.data);
        });
    }, []);



    return (
        <div style={{ height: 500, width: 902 }}>
            <ScrollFollow
                startFollowing={true}
                render={({ follow, onScroll }) => (
                    <LazyLog
                        extraLines={1}
                        enableSearch
                        text={logs.map(l => `[${l.timestamp}]: ${l.message}`).join("\n")}
                        caseInsensitive
                        scrollToLine={100}
                        loaded={true}
                        follow={follow}
                        onScroll={onScroll}
                    />
                )}
            />
        </div>
    );
}

export default LogWindow;

// @ts-ignore
function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            // @ts-ignore
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}