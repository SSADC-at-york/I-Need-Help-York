from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator
from pymongo import MongoClient
from bson import ObjectId
from typing import List, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from enum import Enum
from fastapi import FastAPI, HTTPException, Depends, Query, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from fastapi.responses import JSONResponse
from fastapi import Header

# Create FastAPI instance
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017")
db = client["resources_db"]
collection = db["resources"]
collection_users = db["users"]

# Authentication settings
SECRET_KEY = "f8a680e19d21d4cfd417505039619127a382d5f191c039a945f01560b1717986348a4dcc0cae97b3e9d9ec67b4271c990239bf0a9bd18596130778d5ada872ca"  # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Enums
class ResourceStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    ROOT = "root"

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    username: str

    @validator('email')
    def validate_york_email(cls, v):
        if not v.endswith(('@yorku.ca', '@my.yorku.ca')):
            raise ValueError('Email must be a York University email address (@yorku.ca or @my.yorku.ca)')
        return v

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: Optional[str] = None
    role: UserRole = UserRole.USER
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Resource(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    description: str
    offered_by: str
    location: Optional[str] = None
    link: Optional[str] = None
    status: ResourceStatus = ResourceStatus.PENDING
    suggested_by: Optional[str] = None
    suggested_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

# Helper Functions
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)



def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Optional[User]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        token_data = TokenData(username=username)
    except JWTError:
        return None

    user = collection_users.find_one({"username": token_data.username})
    if not user:
        return None
    
    user['id'] = str(user['_id'])
    return UserInDB(**user)

async def get_current_root(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ROOT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Root privileges required"
        )
    return current_user

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.ROOT]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def resource_helper(resource) -> dict:
    return {
        "id": str(resource["_id"]),
        "name": resource["name"],
        "category": resource["category"],
        "description": resource["description"],
        "offered_by": resource["offered_by"],
        "location": resource.get("location"),
        "link": resource.get("link"),
        "status": resource.get("status", "pending"),
        "suggested_by": resource.get("suggested_by"),
        "suggested_at": resource.get("suggested_at"),
        "reviewed_by": resource.get("reviewed_by"),
        "reviewed_at": resource.get("reviewed_at"),
        "rejection_reason": resource.get("rejection_reason"),
    }

# Authentication Endpoints
@app.post("/api/users/register", response_model=User)
async def register_user(user: UserCreate):
    if collection_users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    if collection_users.find_one({"username": user.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    user_dict["role"] = UserRole.USER
    user_dict["disabled"] = False
    
    result = collection_users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return User(**user_dict)

@app.post("/api/users/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = collection_users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Resource Endpoints
# Replace the existing get_resources endpoint with this version
@app.get("/api/resources", response_model=List[Resource])
async def get_resources(
    status: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    try:
        query = {}
        current_user = None

        # If there's an authorization header, try to get the user
        if authorization and authorization.startswith('Bearer '):
            token = authorization.split(' ')[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                username = payload.get("sub")
                if username:
                    user = collection_users.find_one({"username": username})
                    if user:
                        current_user = UserInDB(**user)
            except:
                pass

        # If no user or not admin, only show approved resources
        if not current_user or current_user.role != UserRole.ADMIN:
            query["status"] = ResourceStatus.APPROVED
        # If status is specified and user is admin, filter by status
        elif status and current_user and current_user.role == UserRole.ADMIN:
            query["status"] = status

        resources = list(collection.find(query))
        return [resource_helper(resource) for resource in resources]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resources/suggest", response_model=Resource)
async def suggest_resource(
    resource: Resource,
    current_user: User = Depends(get_current_user)
):
    resource_dict = resource.dict(exclude_unset=True)
    resource_dict.update({
        "status": ResourceStatus.PENDING,
        "suggested_by": current_user.username,
        "suggested_at": datetime.utcnow()
    })
    
    result = collection.insert_one(resource_dict)
    new_resource = collection.find_one({"_id": result.inserted_id})
    
    if new_resource:
        return resource_helper(new_resource)
    raise HTTPException(status_code=400, detail="Resource suggestion failed")

@app.get("/api/resources/pending", response_model=List[Resource])
async def get_pending_resources(current_user: User = Depends(get_current_admin)):
    pending_resources = list(collection.find({"status": ResourceStatus.PENDING}))
    return [resource_helper(resource) for resource in pending_resources]

@app.put("/api/resources/{id}/review")
async def review_resource(
    id: str,
    status: str = Body(...),
    rejection_reason: Optional[str] = Body(None),
    current_user: User = Depends(get_current_admin)
):
    try:
        # Validate status
        if status not in [ResourceStatus.APPROVED, ResourceStatus.REJECTED]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Must be 'approved' or 'rejected'"
            )

        # Prepare update data
        update_data = {
            "status": status,
            "reviewed_by": current_user.username,
            "reviewed_at": datetime.utcnow()
        }
        
        if status == ResourceStatus.REJECTED and rejection_reason:
            update_data["rejection_reason"] = rejection_reason

        # Update the resource
        result = collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Resource not found"
            )

        # Get and return the updated resource
        updated_resource = collection.find_one({"_id": ObjectId(id)})
        if not updated_resource:
            raise HTTPException(
                status_code=404,
                detail="Resource not found"
            )
            
        return resource_helper(updated_resource)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    

@app.get("/api/resources/by-status/{status}", response_model=List[Resource])
async def get_resources_by_status(
    status: str,
    current_user: User = Depends(get_current_admin)
):
    try:
        if status not in [ResourceStatus.PENDING, ResourceStatus.APPROVED, ResourceStatus.REJECTED]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )
            
        resources = list(collection.find({"status": status}))
        return [resource_helper(resource) for resource in resources]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# Add this health check endpoint
@app.get("/api/health")
async def health_check():
    try:
        # Ping MongoDB
        client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    
# Add these new endpoints to your main.py after your existing endpoints

@app.post("/api/resources/admin/create", response_model=Resource)
async def admin_create_resource(
    resource: Resource,
    current_user: User = Depends(get_current_admin)
):
    try:
        resource_dict = resource.dict(exclude_unset=True)
        resource_dict.update({
            "status": ResourceStatus.APPROVED,
            "suggested_by": current_user.username,
            "suggested_at": datetime.utcnow(),
            "reviewed_by": current_user.username,
            "reviewed_at": datetime.utcnow()
        })
        
        result = collection.insert_one(resource_dict)
        new_resource = collection.find_one({"_id": result.inserted_id})
        
        if new_resource:
            return resource_helper(new_resource)
        raise HTTPException(status_code=400, detail="Failed to create resource")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/resources/admin/{id}", response_model=Resource)
async def admin_update_resource(
    id: str,
    resource: Resource,
    current_user: User = Depends(get_current_admin)
):
    try:
        update_data = resource.dict(exclude_unset=True)
        update_data.pop('id', None)  # Remove id from update data if present
        
        result = collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Resource not found")
            
        updated_resource = collection.find_one({"_id": ObjectId(id)})
        return resource_helper(updated_resource)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/resources/admin/{id}")
async def admin_delete_resource(
    id: str,
    current_user: User = Depends(get_current_admin)
):
    try:
        result = collection.delete_one({"_id": ObjectId(id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Resource not found")
            
        return {"message": "Resource deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/admin/all", response_model=List[Resource])
async def admin_get_all_resources(
    current_user: User = Depends(get_current_admin)
):
    try:
        resources = list(collection.find({}))
        return [resource_helper(resource) for resource in resources]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/admin/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_root)):
    try:
        users = list(collection_users.find({}))
        return [
            User(
                id=str(user["_id"]),
                email=user["email"],
                username=user["username"],
                role=user["role"],
                disabled=user.get("disabled", False)
            ) for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: UserRole = Body(..., embed=True),
    current_user: User = Depends(get_current_root)
):
    try:
        print("DEBUG role =>", repr(role))  # << Add this

        # Find the target user by converting the provided user_id to ObjectId
        target_user = collection_users.find_one({"_id": ObjectId(user_id)})
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Do not allow changing the role of a root user
        if target_user.get("role") == UserRole.ROOT:
            raise HTTPException(status_code=400, detail="Cannot modify root user roles")
        
        result = collection_users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": role}}
        )
        
        # Use matched_count instead of modified_count
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Even if no actual change occurred, return a success message
        return {"message": f"User role updated to {role}"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)