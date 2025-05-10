import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import './Models.scss';

function Models({ results, loadMore, loading, hasMore, selectModel }) {
    const containerRef = useRef();

    useEffect(() => {
        const onScroll = () => {
            const el = containerRef.current;
            if (!el) return;
            const bottomReached = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
            if (bottomReached) loadMore();
        };

        const el = containerRef.current;
        if (el) el.addEventListener("scroll", onScroll);
        return () => el && el.removeEventListener("scroll", onScroll);
    }, [hasMore, loading]);

    useLayoutEffect(() => {
        const videos = containerRef.current.querySelectorAll('video');
        if (videos === null) return;
        videos.forEach(video => {
            video.addEventListener('mouseenter', function () {
                var playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Playback started successfully
                    }).catch(error => {
                        // Handle the error
                        console.error("Playback failed:", error);
                    });
                }
            });

            video.addEventListener('mouseleave', function () {
                video.pause();
                video.currentTime = 0; // Reset video to start
            });
        });
    }, [hasMore, loading]);


    return (
        <div class="models">
            <div class="grid-container" ref={containerRef}>
                {results.map((item, idx) => (
                    <div class="grid-card" key={idx} onClick={() => selectModel(item)}>
                        {item.image_url && item.image_url.endsWith('.mp4')
                            ? <video src={item.image_url} loop muted></video>
                            : <img src={item.image_url}></img>
                        }

                        <div class="header">
                            <div class="type">{item.type}</div>
                            <div class="spacer" />
                            <div class="base-model">{item.baseModel}</div>
                        </div>
                        <div class="footer">
                            <div class="name">{item.name}</div>
                        </div>
                    </div>
                ))}
                {loading && <p>Loading...</p>}
                {!hasMore && <p>No more results.</p>}
            </div>
        </div>
    );
}

export default Models;