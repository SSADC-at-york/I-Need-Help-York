from pymongo import MongoClient

def seed_sample_resources():
    # Connect to MongoDB (update the connection string if needed)
    client = MongoClient("mongodb://localhost:27017")
    db = client["resources_db"]      # Use your database name here
    collection = db["resources"]       # Use your collection name here

    # Define a list of sample resources
    sample_resources = [
        {
            "name": "Academic Counseling",
            "category": "ACADEMIC",
            "description": "Get help with academic planning and advice.",
            "offered_by": "University Academic Services",
            "location": "Building A, Room 101",
            "link": "http://example.com/academic-counseling"
        },
        {
            "name": "Health Center",
            "category": "HEALTH",
            "description": "Access to health and wellness resources.",
            "offered_by": "University Health Center",
            "location": "Building B, Room 202",
            "link": "http://example.com/health-center"
        },
        {
            "name": "Administrative Office",
            "category": "ADMINISTRATIVE",
            "description": "Assistance with administrative tasks.",
            "offered_by": "University Administration",
            "location": "Building C, Room 303",
            "link": "http://example.com/administrative-office"
        },
        {
            "name": "Student Life Services",
            "category": "STUDENT LIFE",
            "description": "Support for student activities and engagement.",
            "offered_by": "Student Affairs",
            "location": "Building D, Room 404",
        }
    ]

    # (Optional) Clear any existing documents in the collection
    collection.delete_many({})
    
    # Insert the sample resources into the collection
    result = collection.insert_many(sample_resources)
    
    print("Inserted sample resources with IDs:")
    for resource_id in result.inserted_ids:
        print(resource_id)

if __name__ == "__main__":
    seed_sample_resources()
