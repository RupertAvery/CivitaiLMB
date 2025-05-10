import React, { useEffect, useRef, useState } from "react";
import './Types.scss';

function Types({ onChange }) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [items, setItems] = useState([]);

    const toggleItem = (item) => {
        const isSelected = selectedItems.includes(item);
        const updated = isSelected
            ? selectedItems.filter((t) => t !== item)
            : [...selectedItems, item];

        setSelectedItems(updated);
        onChange(updated); // pass updated tags to parent
    };


    const loadData = async () => {
        const url = `/api/types`;

        const res = await fetch(url);
        const data = await res.json();

        setItems((prev) => data);
    }

    useEffect(() => {
        loadData();
    }, []);

    return <div class="filter">
        <div class="header">Types</div>
        <div class="items">
            {items.map((item, idx) => (<div>
                <label key={idx}>
                    <input type="checkbox"
                        checked={selectedItems.includes(item.type)}
                        onChange={() => toggleItem(item.type)}
                    /> {item.type}
                </label>
            </div>))}
        </div>
    </div>
}

export default Types;