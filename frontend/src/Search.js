import { useEffect, useState } from "react";
import './Apps.scss';
import Models from "./Models"
import Tags from "../src/Tags"
import Types from "../src/Types"
import BaseModels from "../src/BaseModels"
import Model from "../src/Model"

function Search() {
    const [types, setTypes] = useState([]);
    const [baseModels, setBaseModels] = useState([]);
    const [tags, setTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [modelId, setModelId] = useState();

    const BATCH_SIZE = 100;

    const [results, setResults] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    let [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        // Reset state for new search
        setResults([]);
        setSkip(0);
        setHasMore(true);
        setQuery(searchTerm);
    };

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const url = "/api/models";
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: query,
                    types: types,
                    baseModels: baseModels,
                    tags: tags,
                    limit: 100,
                    skip: skip,
                })
            });

            const data = await res.json();

            setResults((prev) => [...prev, ...data.results]);
            setSkip((prev) => prev + BATCH_SIZE);

            if (skip + BATCH_SIZE >= data.total) setHasMore(false);
        } catch (err) {
            console.error("Fetch failed", err);
        }

        setLoading(false);
    };

    useEffect(() => {
        setResults([]);
        setSkip(0);
        skip = 0;
        setHasMore(true);
        loadMore(); // initial load or on search
    }, [query, types, baseModels, tags]);


    const selectModel = (item) => {
        setModelId(item.model_id);
    }

    const closeModel = () => {
        setModelId(null);
    }

    return (
        <div class="app-container">
            <div class="filters">
                <div class="filter">
                    <div class="query">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search"
                            />
                            <button type="submit" style={{ display: 'none' }}>Search</button>
                        </form>
                    </div>
                </div>
                <Types onChange={(types) => setTypes(types)}></Types>
                <BaseModels onChange={(baseModels) => setBaseModels(baseModels)}></BaseModels>
                <Tags onChange={(tags) => setTags(tags)}></Tags>

            </div>
            <Models results={results} loadMore={loadMore} loading={loading} hasMore={hasMore} selectModel={selectModel}>
            </Models>
            {modelId && <Model modelId={modelId} close={closeModel}></Model>}
        </div >
    );
}

export default Search;