import { useState } from "react";
import './ImageCarousel.scss';

export default function ImageCarousel({ images }) {
    const [index, setIndex] = useState(0);

    const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const next = () => setIndex((i) => (i + 1) % images.length);

    if (!images || images.length === 0) return null;

    return (
        <div className="carousel">
            <button onClick={prev} className="nav left">‹</button>
            {images[index].endsWith('.mp4') ?
                <video src={images[index]} alt={`Image ${index}`} className="carousel-image" autoPlay loop/>
                : <img src={images[index]} alt={`Image ${index}`} className="carousel-image" />
            }
            <button onClick={next} className="nav right">›</button>
        </div>
    );
}