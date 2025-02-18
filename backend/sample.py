# seed_resources.py
from pymongo import MongoClient

def seed_sample_resources():
    client = MongoClient("mongodb://localhost:27017")
    db = client["resources_db"]
    collection = db["resources"]

    # Sample resources
    sample_resources = [
        {
            "name": "Academic Counseling",
            "category": "ACADEMIC",
            "description": "Get help with academic planning and advice.",
            "offered_by": "University Academic Services",
            "location": "Building A, Room 101",
            "link": "http://example.com/academic-counseling",
            "status": "approved"  # Make sure to set status as approved
        },
        {
            "name": "Health Center",
            "category": "HEALTH",
            "description": "Access to health and wellness resources.",
            "offered_by": "University Health Center",
            "location": "Building B, Room 202",
            "link": "http://example.com/health-center",
            "status": "approved"
        },
        {
            "name": "Administrative Office",
            "category": "ADMINISTRATIVE",
            "description": "Assistance with administrative tasks.",
            "offered_by": "University Administration",
            "location": "Building C, Room 303",
            "link": "http://example.com/administrative-office",
            "status": "approved"
        },
        {
            "name": "Student Life Services",
            "category": "STUDENT LIFE",
            "description": "Support for student activities and engagement.",
            "offered_by": "Student Affairs",
            "location": "Building D, Room 404",
            "status": "approved"
        }
    ]

    # Clear existing resources
    collection.delete_many({})
    
    # Insert new resources
    result = collection.insert_many(sample_resources)
    
    print(f"Inserted {len(result.inserted_ids)} sample resources")

if __name__ == "__main__":
    seed_sample_resources()