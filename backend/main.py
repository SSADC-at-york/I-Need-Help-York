from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from typing import List, Optional

# Create FastAPI instance
app = FastAPI()

# Configure CORS (adjust the origins as needed)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # For development, you could use ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB using PyMongo (synchronous)
client = MongoClient("mongodb://localhost:27017")
db = client["resources_db"]      # Database name
collection = db["resources"]       # Collection name

# Pydantic model for a resource, now including a 'status' field.
class Resource(BaseModel):
    id: Optional[str]  # Will be populated from MongoDB's _id
    name: str
    category: str
    description: str
    offered_by: str
    location: Optional[str] = None
    link: Optional[str] = None
    status: Optional[str] = "approved"  # Default to "approved" for manually added resources

# Helper function to convert MongoDB documents to JSON-serializable dicts
def resource_helper(resource) -> dict:
    return {
        "id": str(resource["_id"]),
        "name": resource["name"],
        "category": resource["category"],
        "description": resource["description"],
        "offered_by": resource["offered_by"],
        "location": resource.get("location"),
        "link": resource.get("link"),
        "status": resource.get("status", "approved"),  # Include status in output
    }

# GET endpoint with optional status filtering
@app.get("/api/resources", response_model=List[Resource])
def get_resources(status: Optional[str] = Query(None)):
    query = {}
    if status:
        query["status"] = status
    resources = list(collection.find(query))
    return [resource_helper(resource) for resource in resources]

# POST endpoint to add a new resource.
@app.post("/api/resources", response_model=Resource)
def add_resource(resource: Resource):
    resource_dict = resource.dict(exclude_unset=True)
    # If the resource was submitted as a suggestion, it should have status "pending"
    # Otherwise (e.g., via admin manual addition) it may already be "approved"
    result = collection.insert_one(resource_dict)
    new_resource = collection.find_one({"_id": result.inserted_id})
    if new_resource:
        return resource_helper(new_resource)
    raise HTTPException(status_code=400, detail="Resource could not be created.")

# PUT endpoint to update resource details (e.g., to update its status)
@app.put("/api/resources/{id}", response_model=Resource)
def update_resource(id: str, update_data: dict):
    # update_data is expected to contain at least a 'status' field (e.g., {"status": "approved"})
    result = collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    if result.modified_count == 1:
        updated_resource = collection.find_one({"_id": ObjectId(id)})
        if updated_resource:
            return resource_helper(updated_resource)
    raise HTTPException(status_code=404, detail="Resource not found or update failed.")

@app.delete("/api/resources/{id}")
def delete_resource(id: str):
    result = collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"detail": "Resource deleted"}
    raise HTTPException(status_code=404, detail="Resource not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
