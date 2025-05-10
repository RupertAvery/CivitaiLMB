import React, { useEffect, useState } from "react";
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import './Model.scss'
import ImageCarousel from "./ImageCarousel";

function Model({ modelId, close }) {

    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modelVersion, setModelVersion] = useState({});
    const [modelVersionId, setModelVersionId] = useState(null);
    const [copied, setCopied] = useState({});

    const loadModelversion = async () => {
        if (!modelVersionId)
            return;

        const url = `/api/model-versions/${modelVersionId}`;

        const res = await fetch(url);
        if (!res.ok) {
            setError("Failed to load model");
            return;
        }
        const data = await res.json();

        setCopied({});

        setModelVersion(data);
        setLoading(false);
    }


    const loadData = async () => {
        const url = `/api/models/${modelId}`;

        const res = await fetch(url);
        if (!res.ok) {
            setError("Failed to load model");
            return;
        }
        const data = await res.json();

        setModel(data);
        setModelVersionId(data.modelVersions[0].id);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [modelId]);

    useEffect(() => {
        loadModelversion();
    }, [modelVersionId]);

    function downHandler({ key }) {
        if (key === 'Escape') {
            // Close the model
            close();
        }
    }

    window.addEventListener('keydown', downHandler);

    function copy(idx, text) {
        return (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text).then(() => {
                const _copied = { ...copied };
                _copied[idx] = true;
                setCopied(_copied);
                setTimeout(() => {
                    const _copied = { ...copied };
                    _copied[idx] = false;
                    setCopied(_copied);
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    }

    function open(url) {
        return (e) => {
            e.stopPropagation();
            window.open(url, '_blank');
        }
    }

    return <div class="model">
        <div class="close" onClick={close}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}
        {model && (
            <div class="model-details">
                <div>
                    <h1>{model.model.name}</h1>
                </div>
                <div class="pill-list">
                    <h2>Tags</h2>
                    <ul>
                        {model.tags.map((tag, idx) => (
                            <li key={idx}>{tag}</li>
                        ))}
                    </ul>
                </div>

                <div class="pill-list">
                    <h2>Versions</h2>
                    <ul>
                        {model.modelVersions.map((mv) => (
                            <li className={`model-version-link cursor-pointer clickable ${modelVersionId == mv.id ? 'selected' : ''}`} key={mv.id} onClick={() => setModelVersionId(mv.id)}>{mv.name}</li>
                        ))}
                    </ul>
                </div>

                {modelVersion && <div class="model-version">
                    <div class="model-version-images">
                        {modelVersion.images && modelVersion.images.length > 0 &&
                            <ImageCarousel images={modelVersion.images.map(i => i.url)} />
                        }
                    </div>
                    {modelVersion.modelVersion &&
                        <div class="model-version-details">
                            <div class="model-version-download">
                                {modelVersion.modelVersion && modelVersion.modelVersion.downloadUrl && <button onClick={open(modelVersion.modelVersion.downloadUrl)}><ArrowDownTrayIcon /> Download</button>}
                                <button onClick={open(`https://civitai.com/models/${modelId}?modelVersionId=${modelVersionId}`)}>
                                    <ArrowTopRightOnSquareIcon /> CivitAi
                                </button>
                            </div>

                            <table class="model-version-table">

                                <tr>
                                    <td>Base Model</td>
                                    <td>
                                        {modelVersion.modelVersion.baseModel}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Type</td>
                                    <td>
                                        {model.model.type}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Size</td>
                                    <td>
                                        {modelVersion.modelVersion.size}
                                    </td>
                                </tr>
                                {modelVersion && modelVersion.trainedWords && modelVersion.trainedWords.length > 0 &&
                                    <tr class="model-version-trainedWords">
                                        <td>Trained Words</td>
                                        <td>
                                            <div class="pill-list">
                                                <ul>
                                                    {modelVersion.trainedWords.map((words, idx) => (
                                                        <li class={`cursor-pointer clickable ${copied[idx + ''] ? 'clicked' : ''}`} key={idx} onClick={copy(idx, words)}>{words}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                }

                            </table>


                        </div>
                    }
                </div>}

                {model.model.description && model.model.description.length > 0 &&
                    <div class="description" dangerouslySetInnerHTML={{ __html: model.model.description }}>
                    </div>
                }


            </div>
        )
        }

    </div>;
}


export default Model;