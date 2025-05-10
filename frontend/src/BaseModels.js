import React, { useEffect, useRef, useState } from "react";
import './BaseModels.scss';

function BaseModels({ onChange }) {
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
        const url = `/api/base-models`;

        const res = await fetch(url);
        const data = await res.json();

        setItems((prev) => data);
    }

    useEffect(() => {
        loadData();
    }, []);

    return <div class="filter">
        <div class="header">Base Models</div>
        <div class="items">
            {items.map((item, idx) => (<div>
                <label>
                    <input type="checkbox"
                        checked={selectedItems.includes(item.baseModel)}
                        onChange={() => toggleItem(item.baseModel)}
                    /> {item.baseModel}
                </label>
            </div>))}
        </div>
    </div>
}

export default BaseModels;