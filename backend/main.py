from pydantic import BaseModel
from typing import List, Optional
from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import sqlite3;
import os
import gdown
import py7zr

status = "starting"

CWD = os.path.dirname(__file__)
DB_PATH = os.path.join(CWD, "models.db")

class ModelQuery(BaseModel):
    query: Optional[str] = None  # your search text
    types: Optional[List[str]] = None
    baseModels: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    skip: int = 0
    limit: int = 100


def query_db(query, params=()):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

app = FastAPI()

# Serve API route
@app.get("/api/status")
def health_check():
    return {"status": status} 

# Serve API route
@app.get("/api/base-models")
def get_types():
    query = """select baseModel from modelVersions 
group by baseModel
order by baseModel
"""
    results = query_db(query)
    return results

# Serve API route
@app.get("/api/types")
def get_types():
    query = """select type from models 
group by type
order by type
"""
    results = query_db(query)
    return results


# Serve API route
@app.get("/api/tags")
def get_tags():
    query = """select tag, count(*) as 'count' from tags 
group by tag
having count(*) > 10
order by count(*) desc
limit 100
"""
    results = query_db(query)
    return results


# Serve API route
@app.get("/api/model-versions/{model_version_id}")
def get_model(model_version_id: int):
    modelVersions = query_db("SELECT * FROM modelVersions WHERE id = ?", [model_version_id])

    if not modelVersions:
        raise HTTPException(status_code=404, detail="Model not found")
   
    trainedWords = query_db(f"SELECT words FROM trainedWords WHERE modelVersion_id = ?", [model_version_id])
    images = query_db(f"SELECT * FROM images WHERE modelVersion_id = ?", [model_version_id])
 
    return {
        "modelVersion": modelVersions[0],
        "trainedWords": [trainedWords["words"] for trainedWords in trainedWords],
        "images": images,
    }

# Serve API route
@app.get("/api/models/{model_id}")
def get_model(model_id: int):
    query = """
    SELECT 
        m.name, 
        m.type, 
        m.description,
        m.nsfw,
        m.downloadCount
    FROM models m
    WHERE m.id = ?
    """
    models = query_db(query, [model_id])
    modelVersions = query_db("SELECT * FROM modelVersions WHERE model_id = ?", [model_id])
    tags = query_db("SELECT tag FROM tags WHERE model_id = ?", [model_id])

    if not models:
        raise HTTPException(status_code=404, detail="Model not found")

    return {
        "model": models[0],
        "modelVersions": modelVersions,
        "tags": [tags["tag"] for tags in tags]
    }

# Serve API route
@app.post("/api/models")
def get_models(query: ModelQuery):

    baseQuery = """SELECT 
    m.id AS model_id, 
    m.name, 
    m.type, 
    mv.baseModel, 
    i.url AS image_url
FROM models m
JOIN (
    SELECT 
        mv1.id, mv1.baseModel, mv1.model_id
    FROM modelVersions mv1
    WHERE mv1.id = (
        SELECT id 
        FROM modelVersions mv2 
        WHERE mv2.model_id = mv1.model_id 
        ORDER BY mv2.id ASC 
        LIMIT 1
    )
) mv ON mv.model_id = m.id
LEFT JOIN (
    SELECT 
        i1.modelVersion_id, i1.url
    FROM images i1
    WHERE i1.id = (
        SELECT id 
        FROM images i2 
        WHERE i2.modelVersion_id = i1.modelVersion_id 
        ORDER BY i2.id ASC 
        LIMIT 1
    )
) i ON i.modelVersion_id = mv.id
"""
    result_params = []
    filters = []
    joins = []

    # Get paginated results
    if query.query and len(query.query.strip()) > 0:

        # Split the query into words
        words = query.query.split()

        orFilters = []

        for word in words:
            orFilters += ["""((m.name LIKE ?)
                    OR EXISTS (
            SELECT 1 FROM tags t 
            WHERE t.model_id = m.id
            AND t.tag LIKE ?
            GROUP BY t.model_id
        ) OR EXISTS (
            SELECT 1 FROM trainedWords tw
            JOIN modelVersions mv ON tw.modelVersion_id = mv.id
            WHERE mv.model_id = m.id
            AND tw.words LIKE ?
        ))"""]

            result_params += [f"%{query.query}%", f"%{query.query}%", f"%{query.query}%"]

        # Join the OR filters with "OR"
        orFilter = " OR ".join(orFilters)


        # Create 
        filters += [orFilter]

        # filters += [f""""""]


    if query.types:
        type_count = len(query.types)
        type_placeholders = ",".join(["?"] * type_count)

        filters += [f"""(
            m.type IN ({type_placeholders})
        )"""]

        result_params += query.types

    if query.baseModels:
        models_count = len(query.baseModels)
        models_placeholders = ",".join(["?"] * models_count)

        filters += [f"""(
            mv.baseModel IN ({models_placeholders})
        )"""]

        result_params += query.baseModels

    if query.tags:
        tag_count = len(query.tags)
        tag_placeholders = ",".join(["?"] * tag_count)

        filters += [f"""EXISTS (
            SELECT 1 FROM tags t 
            WHERE t.model_id = m.id
            AND t.tag IN ({tag_placeholders})
            GROUP BY t.model_id
        )"""]

        result_params += query.tags


    joinClause = " AND ".join(joins)
    whereClause = " AND ".join(filters)

    base_count_query = """SELECT COUNT(*) 
    FROM models m
    JOIN (
        SELECT 
            mv1.id, mv1.baseModel, mv1.model_id
        FROM modelVersions mv1
        WHERE mv1.id = (
            SELECT id 
            FROM modelVersions mv2 
            WHERE mv2.model_id = mv1.model_id 
            ORDER BY mv2.id ASC 
            LIMIT 1
        )
    ) mv ON mv.model_id = m.id
    """

    count_query = f"{base_count_query} {joinClause} {'WHERE' if len(whereClause) > 0 else ''} {whereClause}"

    print(count_query)
    print(result_params)

    total = query_db(count_query, result_params)[0]["COUNT(*)"]

    result_query = f"{baseQuery} {joinClause} {'WHERE' if len(whereClause) > 0 else ''} {whereClause} ORDER BY m.name ASC LIMIT ? OFFSET ?"

    result_params += (query.limit, query.skip)

    print(result_query)
    print(result_params)

    results = query_db(result_query, result_params)



    return {"results": results, "total": total}

# Path to the React build directory
frontend_build_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')

# Serve React static files
app.mount("/static", StaticFiles(directory=os.path.join(frontend_build_path, "static")), name="static")

# Catch-all route for React (for SPA routing)
@app.get("/{full_path:path}")
async def serve_react_app(request: Request, full_path: str = ""):
    index_file_path = os.path.join(frontend_build_path, "index.html")
    if os.path.exists(index_file_path):
        return FileResponse(index_file_path)
    return {"error": "React build not found"}

import threading
import time

def dummy():
    global status
    status = "downloading"
    time.sleep(10)
    status = "extracting"
    time.sleep(10)
    status = "ready"

def checkDbExists():
    global status

    if not os.path.exists(DB_PATH):

        status = "downloading"
        print("Downloading models.7z...")
        # Download the file from Google Drive 
        file_id = '1CBDBmaRa_85ohZ4Ok0tfAnQ8lbrQWph8'
        url = f'https://drive.google.com/uc?id={file_id}'
        output = 'models.7z'
        gdown.download(url, output, quiet=False)

        print("Extracting models.7z...")

        status = "extracting"

        with py7zr.SevenZipFile('models.7z', 'r') as archive:
            archive.extractall(CWD)

        status = "cleaning"
        os.remove("models.7z")

    status = "ready"

# thread1 = threading.Thread(target=dummy, args=())
# thread1.start()

thread1 = threading.Thread(target=checkDbExists, args=())
thread1.start()
