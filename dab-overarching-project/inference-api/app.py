from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.tree import DecisionTreeRegressor

server = FastAPI()

class InferenceData(BaseModel):
    exercise: int
    code: str

model = None

@server.post("/inference-api/predict")
async def predict_endpoint(data: InferenceData):
    global model
    if model is None:
        return {"prediction": 0.0}
    try:
        prediction = model.predict([data.code])[0]
        return {"prediction": float(prediction)}
    except:
        return {"prediction": 0.0}

@server.post("/inference-api/train")
async def train_endpoint(data: List[InferenceData]):
    global model
    X = [item.code for item in data]
    y = [item.exercise for item in data]
    
    model = make_pipeline(CountVectorizer(), DecisionTreeRegressor())
    if len(X) > 0:
        model.fit(X, y)
        
    return {"status": "Model trained successfully"}