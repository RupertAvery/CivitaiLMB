import React, { useEffect, useRef, useState } from "react";
import './Tags.scss';

function Tags({ onChange }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [items, setItems] = useState([]);

    const toggleTag = (tag) => {
        const isSelected = selectedTags.includes(tag);
        const updated = isSelected
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag];

        setSelectedTags(updated);
        onChange(updated); // pass updated tags to parent
    };


    const loadData = async () => {
        const url = `/api/tags`;

        const res = await fetch(url);
        const data = await res.json();

        setItems((prev) => data);
    }

    useEffect(() => {
        loadData();
    }, []);

    return <div class="filter">
        <div class="header">Tags</div>
        <div class="items">
            {items.map((item, idx) => (<div>
                <label>
                    <input type="checkbox"
                        checked={selectedTags.includes(item.tag)}
                        onChange={() => toggleTag(item.tag)}
                    /> {item.tag}
                </label>
            </div>))}
        </div>
    </div>
}

export default Tags;